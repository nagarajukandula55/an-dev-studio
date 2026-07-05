// ============================================================================
// AN Dev Studio — /api/anu/status  (GET)
// Checks if Ollama is running and ANu model is installed
// ============================================================================

import { getOllamaConfig } from "@/lib/configStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OllamaModel {
    name: string;
    size: number;
    details?: { family?: string };
}

export async function GET(): Promise<Response> {
    const ollama = getOllamaConfig();
    const host = ollama.host;

    try {
        const r = await fetch(`${host}/api/tags`, {
            signal: AbortSignal.timeout(2000),
        });

        if (!r.ok) {
            return Response.json({ running: false, anuInstalled: false, models: [] });
        }

        const data = await r.json() as { models?: OllamaModel[] };
        const models = (data.models ?? []).map(m => ({
            name:   m.name,
            size:   m.size,
            family: m.details?.family ?? "",
        }));

        const anuInstalled = models.some(m => m.name === "anu" || m.name.startsWith("anu:"));

        return Response.json({
            running:      true,
            anuInstalled,
            enabled:      ollama.enabled,
            defaultModel: ollama.defaultModel,
            models,
            ollamaHost:   host,
        });
    } catch {
        return Response.json({
            running:      false,
            anuInstalled: false,
            enabled:      ollama.enabled,
            models:       [],
            ollamaHost:   host,
        });
    }
}
