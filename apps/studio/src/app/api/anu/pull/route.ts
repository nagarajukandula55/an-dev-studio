// ============================================================================
// AN Dev Studio — /api/anu/pull  (POST)
// Proxies Ollama's model pull endpoint and streams progress back to the
// browser, so the Settings UI can show a real download progress bar without
// the user ever touching a terminal.
// ============================================================================

import { getOllamaConfig } from "@/lib/configStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Basic allowlist-shaped validation: Ollama model tags look like
// "name" or "namespace/name:tag" using a restricted character set. This
// isn't a secrets boundary (Ollama's own API is the real gate) but it stops
// obviously malformed input from reaching the local Ollama daemon.
const MODEL_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,127}$/;

export async function POST(req: Request): Promise<Response> {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = (body as { name?: unknown } | null)?.name;
    if (typeof name !== "string" || !MODEL_NAME_PATTERN.test(name)) {
        return Response.json({ error: "Invalid or missing model name" }, { status: 400 });
    }

    const { host } = getOllamaConfig();

    const controller = new AbortController();
    req.signal.addEventListener("abort", () => controller.abort());

    let upstream: Response;
    try {
        upstream = await fetch(`${host}/api/pull`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, stream: true }),
            signal: controller.signal,
        });
    } catch {
        return Response.json(
            { error: `Could not reach Ollama at ${host}. Is it running?` },
            { status: 502 },
        );
    }

    if (!upstream.ok || !upstream.body) {
        const text = await upstream.text().catch(() => "");
        return Response.json(
            { error: `Ollama pull failed (${upstream.status}): ${text || upstream.statusText}` },
            { status: 502 },
        );
    }

    // Ollama streams newline-delimited JSON progress objects
    // (e.g. {"status":"downloading","completed":123,"total":456}).
    // Forward them through unchanged — the client parses each line itself.
    return new Response(upstream.body, {
        headers: {
            "Content-Type": "application/x-ndjson",
            "Cache-Control": "no-store",
            "X-Accel-Buffering": "no",
        },
    });
}
