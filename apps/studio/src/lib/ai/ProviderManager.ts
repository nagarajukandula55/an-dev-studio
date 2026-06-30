// ============================================================================
// AN Dev Studio — ProviderManager
// Circuit-breaker failover: Groq → Cerebras → OpenRouter → Gemini → HuggingFace
// ============================================================================

import type { ChatMessage, ChatStreamCallback, IProvider, ProviderStatus, StreamChunk } from "./types";
import { getAgentPrompt } from "./agentPrompts";
import {
    CerebrasProvider,
    GeminiProvider,
    GroqProvider,
    HuggingFaceProvider,
    OpenRouterProvider,
} from "./providers";

// Circuit breaker: after this many consecutive failures, skip provider for COOLDOWN_MS
const MAX_FAILURES  = 3;
const COOLDOWN_MS   = 5 * 60 * 1000; // 5 minutes

interface ProviderHealth {
    failures:    number;
    lastFailure: number; // timestamp
}

export class ProviderManager {
    private static instance: ProviderManager;

    // Ordered fallback chain
    private readonly chain: IProvider[] = [
        new GroqProvider(),
        new CerebrasProvider(),
        new OpenRouterProvider(),
        new GeminiProvider(),
        new HuggingFaceProvider(),
    ];

    private health = new Map<string, ProviderHealth>();

    private constructor() {}

    static getInstance(): ProviderManager {
        if (!ProviderManager.instance) {
            ProviderManager.instance = new ProviderManager();
        }
        return ProviderManager.instance;
    }

    // ── Public API ──────────────────────────────────────────────────────────

    getStatuses(): ProviderStatus[] {
        return this.chain.map(p => ({
            name:         p.name,
            label:        p.label,
            configured:   p.isAvailable(),
            models:       p.models,
            defaultModel: p.defaultModel,
        }));
    }

    getProvider(name: string): IProvider | undefined {
        return this.chain.find(p => p.name === name);
    }

    async streamChat(
        messages:         ChatMessage[],
        agentType:        string | undefined,
        preferredProvider: string | undefined,
        model:            string | undefined,
        onChunk:          ChatStreamCallback,
        signal?:          AbortSignal,
    ): Promise<{ fullText: string; provider: string; model: string; isFallback: boolean }> {
        const systemPrompt = getAgentPrompt(agentType);
        const fullMessages: ChatMessage[] = [
            { role: "system", content: systemPrompt },
            ...messages,
        ];

        // Build ordered provider list: preferred first, then fallbacks
        const ordered = this.getOrderedChain(preferredProvider);
        const available = ordered.filter(p => p.isAvailable() && !this.isCircuitOpen(p.name));

        if (available.length === 0) {
            throw new Error(
                "No AI providers are configured. Add at least one API key in Settings → Providers."
            );
        }

        let firstAttempt = true;
        for (const provider of available) {
            const targetModel = (firstAttempt && model) ? model : provider.defaultModel;
            firstAttempt = false;

            try {
                const fullText = await provider.chat(fullMessages, targetModel, onChunk, signal);
                this.recordSuccess(provider.name);
                return {
                    fullText,
                    provider:   provider.name,
                    model:      targetModel,
                    isFallback: provider.name !== (preferredProvider ?? available[0].name),
                };
            } catch (err) {
                if (signal?.aborted) throw err;

                this.recordFailure(provider.name);
                const errMsg = err instanceof Error ? err.message : String(err);
                console.error(`[ProviderManager] ${provider.label} failed: ${errMsg}`);

                // Find next available provider to announce switch
                const nextIdx  = available.indexOf(provider) + 1;
                const nextProv = available[nextIdx];

                if (nextProv) {
                    const switchChunk: StreamChunk = {
                        type:          "provider_switch",
                        token:         "",
                        provider:      provider.name,
                        model:         targetModel,
                        isFallback:    true,
                        switchingFrom: provider.name,
                        switchingTo:   nextProv.name,
                    };
                    onChunk(switchChunk);
                }
            }
        }

        throw new Error(
            "All configured AI providers failed. Check rate limits or try again in a few minutes."
        );
    }

    // ── Circuit breaker ──────────────────────────────────────────────────────

    private isCircuitOpen(name: string): boolean {
        const h = this.health.get(name);
        if (!h) return false;
        if (h.failures < MAX_FAILURES) return false;
        return Date.now() - h.lastFailure < COOLDOWN_MS;
    }

    private recordFailure(name: string): void {
        const h = this.health.get(name) ?? { failures: 0, lastFailure: 0 };
        this.health.set(name, { failures: h.failures + 1, lastFailure: Date.now() });
    }

    private recordSuccess(name: string): void {
        this.health.delete(name);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private getOrderedChain(preferred?: string): IProvider[] {
        if (!preferred) return this.chain;
        const pref = this.chain.find(p => p.name === preferred);
        if (!pref) return this.chain;
        return [pref, ...this.chain.filter(p => p.name !== preferred)];
    }
}
