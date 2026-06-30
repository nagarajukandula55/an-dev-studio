// ============================================================================
// AN Dev Studio — /api/chat  (POST)
// Streams tokens as SSE from whichever AI provider is available
// ============================================================================

import { ProviderManager } from "@/lib/ai/ProviderManager";
import type { ChatRequest, StreamChunk } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
    let body: ChatRequest;
    try {
        body = (await req.json()) as ChatRequest;
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { messages, agentType, provider, model } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: "messages array required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Set up abort signal so the stream stops if the client disconnects
    const controller = new AbortController();
    req.signal.addEventListener("abort", () => controller.abort());

    const encoder = new TextEncoder();
    const stream  = new TransformStream<Uint8Array, Uint8Array>();
    const writer  = stream.writable.getWriter();

    const sendSSE = (data: object) => {
        try {
            writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
            // writer closed — ignore
        }
    };

    // Run provider call in the background so we can return the stream immediately
    const manager = ProviderManager.getInstance();

    (async () => {
        try {
            const result = await manager.streamChat(
                messages,
                agentType,
                provider,
                model,
                (chunk: StreamChunk) => sendSSE(chunk),
                controller.signal,
            );

            // Final metadata event
            sendSSE({
                type:       "meta",
                provider:   result.provider,
                model:      result.model,
                isFallback: result.isFallback,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            sendSSE({ type: "error", error: message, provider: provider ?? "unknown", model: model ?? "" });
        } finally {
            try { await writer.close(); } catch { /* already closed */ }
        }
    })();

    return new Response(stream.readable, {
        headers: {
            "Content-Type":  "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection":    "keep-alive",
            "X-Accel-Buffering": "no", // disable nginx buffering
        },
    });
}
