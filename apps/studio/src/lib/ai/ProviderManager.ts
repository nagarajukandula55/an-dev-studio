// ============================================================================
// AN Dev Studio — ProviderManager
// Fallback chain: ANu → Groq → Cerebras → Mistral → Cloudflare → OpenRouter →
//                  Gemini → HuggingFace
// ANu is the in-house model (Ollama). All others are external APIs, ordered
// roughly by generosity/reliability of their free tier as of mid-2026.
// ============================================================================

import type { ChatMessage, ChatStreamCallback, IProvider, ProviderStatus, StreamChunk } from "./types";
import { getAgentPrompt } from "./agentPrompts";
import { licenseManager } from "@/lib/licensing/LicenseManager";
import {
    AnuProvider,
    CerebrasProvider,
    CloudflareProvider,
    GeminiProvider,
    GroqProvider,
    HuggingFaceProvider,
    MistralProvider,
    OpenRouterProvider,
} from "./providers";

// Circuit breaker: after MAX_FAILURES consecutive failures, skip provider for COOLDOWN_MS
const MAX_FAILURES = 3;
const COOLDOWN_MS  = 5 * 60 * 1000; // 5 minutes

interface ProviderHealth {
    failures:    number;
    lastFailure: number;
}

export class ProviderManager {
    private static instance: ProviderManager;

    // ANu first — in-house, private, zero cost
    // Then external cloud providers as fallback
    private readonly chain: IProvider[] = [
        new AnuProvider(),
        new GroqProvider(),
        new CerebrasProvider(),
        new MistralProvider(),
        new CloudflareProvider(),
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

    // ── Public API ───────────────────────────────────────────────────────────

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
        messages:          ChatMessage[],
        agentType:         string | undefined,
        preferredProvider: string | undefined,
        model:             string | undefined,
        onChunk:           ChatStreamCallback,
        signal?:           AbortSignal,
    ): Promise<{ fullText: string; provider: string; model: string; isFallback: boolean }> {
        const systemPrompt = getAgentPrompt(agentType);
        const fullMessages: ChatMessage[] = [
            { role: "system", content: systemPrompt },
            ...messages,
        ];

        // Free plan: local ANu (Ollama) provider only — the paid cloud fallback
        // chain (Groq/Cerebras/Mistral/Cloudflare/OpenRouter/Gemini/HuggingFace)
        // is a Pro feature. Enforced here, not just in the UI, since every
        // agent LLM call (chat and the core-team agents alike) goes through
        // this one method.
        const restrictToAnu = licenseManager.getStatus().plan === "free";

        const ordered   = this.getOrderedChain(preferredProvider);
        const available = ordered.filter(p => p.isAvailable() && !this.isCircuitOpen(p.name) && (!restrictToAnu || p.name === "anu"));

        if (available.length === 0) {
            throw new Error(
                restrictToAnu
                    ? "No AI providers are configured.\n\n" +
                      "The Free plan only uses the local ANu provider — enable it by adding OLLAMA_ENABLED=true " +
                      "and running anu/setup.ps1, or upgrade to Pro to unlock the full cloud fallback chain."
                    : "No AI providers are configured.\n\n" +
                      "Quick start: Add GROQ_API_KEY to .env.local (free at console.groq.com) " +
                      "or enable ANu by adding OLLAMA_ENABLED=true and running anu/setup.ps1.",
            );
        }

        const primaryName = preferredProvider ?? available[0].name;
        let firstAttempt  = true;

        for (let i = 0; i < available.length; i++) {
            const provider    = available[i];
            const targetModel = (firstAttempt && model) ? model : provider.defaultModel;
            firstAttempt      = false;

            try {
                const fullText = await provider.chat(fullMessages, targetModel, onChunk, signal);
                this.recordSuccess(provider.name);
                return {
                    fullText,
                    provider:   provider.name,
                    model:      targetModel,
                    isFallback: provider.name !== primaryName,
                };
            } catch (err) {
                if (signal?.aborted) throw err;

                this.recordFailure(provider.name);
                const errMsg = err instanceof Error ? err.message : String(err);
                console.error(`[ProviderManager] ${provider.label} failed: ${errMsg}`);

                const next = available[i + 1];
                if (next) {
                    const switchChunk: StreamChunk = {
                        type:          "provider_switch",
                        token:         "",
                        provider:      provider.name,
                        model:         targetModel,
                        isFallback:    true,
                        switchingFrom: provider.name,
                        switchingTo:   next.name,
                    };
                    onChunk(switchChunk);
                }
            }
        }

        throw new Error(
            "All configured AI providers failed. " +
            "Check API keys, rate limits, or try again in a few minutes.",
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
