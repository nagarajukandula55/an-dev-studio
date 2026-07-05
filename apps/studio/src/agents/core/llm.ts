// ============================================================================
// AN Dev Studio — Agent LLM helper
//
// Thin wrapper so agents can get a plain text completion without dealing
// with streaming callbacks directly. Reuses the same ProviderManager /
// free-tier fallback chain (ANu -> Groq -> Cerebras -> OpenRouter -> Gemini
// -> HuggingFace) that already powers the chat UI — no new provider wiring
// needed.
// ============================================================================

import { ProviderManager } from "@/lib/ai/ProviderManager";
import type { ChatMessage } from "@/lib/ai/types";

export interface CompleteOptions {
    systemPrompt?: string;
    preferredProvider?: string;
    model?: string;
}

export async function complete(userPrompt: string, opts: CompleteOptions = {}): Promise<string> {
    const messages: ChatMessage[] = [];
    if (opts.systemPrompt) {
        messages.push({ role: "system", content: opts.systemPrompt });
    }
    messages.push({ role: "user", content: userPrompt });

    const manager = ProviderManager.getInstance();
    const result = await manager.streamChat(
        messages,
        undefined, // agentType — ProviderManager's own system prompt layer; we pass our own above instead
        opts.preferredProvider,
        opts.model,
        () => {
            /* no-op: agents consume the final text, not the token stream */
        },
    );
    return result.fullText;
}

/**
 * Asks the model for strict JSON matching a shape the caller expects, with
 * one retry-with-correction pass if the first response isn't valid JSON.
 * Agents use this for structured outputs (file lists, plans) rather than
 * hand-rolled parsing of free text.
 */
export async function completeJson<T>(userPrompt: string, opts: CompleteOptions = {}): Promise<T> {
    const jsonInstruction =
        "\n\nRespond with ONLY valid JSON — no prose, no markdown code fences, no explanation before or after.";

    const first = await complete(userPrompt + jsonInstruction, opts);
    try {
        return JSON.parse(stripCodeFence(first)) as T;
    } catch {
        const corrected = await complete(
            `The following was supposed to be valid JSON but failed to parse. ` +
            `Return ONLY the corrected valid JSON, nothing else:\n\n${first}`,
            opts,
        );
        return JSON.parse(stripCodeFence(corrected)) as T;
    }
}

function stripCodeFence(text: string): string {
    const trimmed = text.trim();
    const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    return fenceMatch ? fenceMatch[1] : trimmed;
}
