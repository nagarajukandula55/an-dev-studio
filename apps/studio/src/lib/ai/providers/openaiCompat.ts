// ============================================================================
// AN Dev Studio — OpenAI-Compatible Provider Base
// Groq, Cerebras, OpenRouter, and HuggingFace all use this format
// ============================================================================

import type { ChatMessage, ChatStreamCallback, IProvider, ModelInfo } from "../types";

export abstract class OpenAICompatProvider implements IProvider {
    abstract readonly name: string;
    abstract readonly label: string;
    abstract readonly baseUrl: string;
    abstract readonly apiKey: string;
    abstract readonly defaultModel: string;
    abstract readonly models: ModelInfo[];

    isAvailable(): boolean {
        return Boolean(this.apiKey?.trim());
    }

    extraHeaders(): Record<string, string> {
        return {};
    }

    async chat(
        messages: ChatMessage[],
        model: string,
        onChunk: ChatStreamCallback,
        signal?: AbortSignal,
    ): Promise<string> {
        const targetModel = model || this.defaultModel;

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
                ...this.extraHeaders(),
            },
            body: JSON.stringify({
                model: targetModel,
                messages,
                stream: true,
                max_tokens: 4096,
                temperature: 0.7,
            }),
            signal,
        });

        if (!response.ok) {
            const body = await response.text().catch(() => "");
            throw new Error(`${this.label} error ${response.status}: ${body || response.statusText}`);
        }

        if (!response.body) {
            throw new Error(`${this.label}: no response body`);
        }

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
                    if (data === "[DONE]") {
                        onChunk({ type: "done", token: "", provider: this.name, model: targetModel });
                        return fullText;
                    }

                    try {
                        const parsed = JSON.parse(data) as {
                            choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>;
                        };
                        const token = parsed.choices?.[0]?.delta?.content ?? "";
                        if (token) {
                            fullText += token;
                            onChunk({ type: "token", token, provider: this.name, model: targetModel });
                        }
                        if (parsed.choices?.[0]?.finish_reason === "stop") {
                            onChunk({ type: "done", token: "", provider: this.name, model: targetModel });
                            return fullText;
                        }
                    } catch {
                        // malformed JSON in stream — skip
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
