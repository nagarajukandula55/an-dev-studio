// ============================================================================
// AN Dev Studio — Google Gemini Provider
// Uses the REST API directly (different format from OpenAI-compat)
// ============================================================================

import type { ChatMessage, ChatStreamCallback, IProvider, ModelInfo } from "../types";
import { getProviderKey } from "@/lib/configStore";

export class GeminiProvider implements IProvider {
    readonly name = "gemini";
    readonly label = "Google Gemini";
    readonly defaultModel = "gemini-1.5-flash";

    readonly models: ModelInfo[] = [
        { id: "gemini-1.5-flash",       name: "Gemini 1.5 Flash",   contextLength: 1048576, description: "Fast, free tier",        free: true },
        { id: "gemini-1.5-flash-8b",    name: "Gemini 1.5 Flash 8B", contextLength: 1048576, description: "Fastest, most free",    free: true },
        { id: "gemini-1.5-pro",         name: "Gemini 1.5 Pro",     contextLength: 2097152, description: "Best quality (limited)", free: false },
    ];

    // Resolved fresh on every call so a key saved via the Settings UI takes
    // effect immediately without a server restart.
    private getApiKey(): string {
        return getProviderKey("gemini") ?? "";
    }

    isAvailable(): boolean {
        return Boolean(this.getApiKey()?.trim());
    }

    async chat(
        messages: ChatMessage[],
        model: string,
        onChunk: ChatStreamCallback,
        signal?: AbortSignal,
    ): Promise<string> {
        const targetModel = model || this.defaultModel;
        const apiKey = this.getApiKey();

        // Separate system message from conversation
        const systemMessage = messages.find(m => m.role === "system");
        const conversationMessages = messages.filter(m => m.role !== "system");

        // Convert to Gemini format
        const contents = conversationMessages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));

        const body: Record<string, unknown> = { contents };
        if (systemMessage) {
            body.systemInstruction = { parts: [{ text: systemMessage.content }] };
        }
        body.generationConfig = { maxOutputTokens: 4096, temperature: 0.7 };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?key=${apiKey}&alt=sse`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal,
        });

        if (!response.ok) {
            const errBody = await response.text().catch(() => "");
            throw new Error(`Gemini error ${response.status}: ${errBody || response.statusText}`);
        }

        if (!response.body) throw new Error("Gemini: no response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) continue;
                    const data = trimmed.slice(5).trim();
                    if (!data) continue;

                    try {
                        const parsed = JSON.parse(data) as {
                            candidates?: Array<{
                                content?: { parts?: Array<{ text?: string }> };
                                finishReason?: string;
                            }>;
                        };

                        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                        if (text) {
                            fullText += text;
                            onChunk({ type: "token", token: text, provider: this.name, model: targetModel });
                        }

                        if (parsed.candidates?.[0]?.finishReason === "STOP") {
                            onChunk({ type: "done", token: "", provider: this.name, model: targetModel });
                            return fullText;
                        }
                    } catch {
                        // malformed — skip
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        onChunk({ type: "done", token: "", provider: this.name, model: targetModel });
        return fullText;
    }
}
