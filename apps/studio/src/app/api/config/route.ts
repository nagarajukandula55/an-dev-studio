// ============================================================================
// AN Dev Studio — /api/config  (GET | POST | DELETE)
// Runtime config: read/write AI provider keys from the Settings UI
// Keys are stored in config/runtime.json (gitignored)
// Environment variables always take priority over stored keys
// ============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import {
    ALLOWED_RUNTIME_KEYS as ALLOWED_KEYS,
    readRuntimeStore as readStore,
    writeRuntimeStore as writeStore,
    isRuntimeConfigPersistent,
} from "@/lib/configStore";

type ProviderSource = "env" | "config" | "none";

interface ProviderInfo {
    configured:   boolean;
    source:       ProviderSource;
    envVar:       string;
}

interface ConfigResponse {
    providers: Record<string, ProviderInfo>;
    ollama: {
        enabled:      boolean;
        host:         string;
        defaultModel: string;
        source:       ProviderSource;
    };
    deployment: {
        vercelToken:   { configured: boolean; source: ProviderSource };
    };
    // Whether saved keys survive a redeploy/cold start. False on serverless
    // hosts (e.g. Vercel) where only /tmp is writable and is not persistent —
    // the Settings UI surfaces this so users know to also set real
    // environment variables for anything they want to keep long-term.
    persistent: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getKey(key: string, store: Record<string, string>): { value: string | undefined; source: ProviderSource } {
    if (process.env[key]) return { value: process.env[key], source: "env" };
    if (store[key])       return { value: store[key],       source: "config" };
    return                       { value: undefined,          source: "none" };
}

// ── GET /api/config ───────────────────────────────────────────────────────────

export async function GET(): Promise<Response> {
    const store = readStore();

    const providerMap: Record<string, string> = {
        groq:        "GROQ_API_KEY",
        cerebras:    "CEREBRAS_API_KEY",
        openrouter:  "OPENROUTER_API_KEY",
        gemini:      "GOOGLE_AI_API_KEY",
        huggingface: "HF_TOKEN",
    };

    const providers: Record<string, ProviderInfo> = {};
    for (const [name, envVar] of Object.entries(providerMap)) {
        const { value, source } = getKey(envVar, store);
        providers[name] = {
            configured: !!value,
            source,
            envVar,
        };
    }

    const ollamaEnabled     = getKey("OLLAMA_ENABLED",       store);
    const ollamaHost        = getKey("OLLAMA_HOST",          store);
    const ollamaModel       = getKey("OLLAMA_DEFAULT_MODEL", store);
    const vercelToken       = getKey("VERCEL_TOKEN",         store);

    const resp: ConfigResponse = {
        providers,
        ollama: {
            enabled:      ollamaEnabled.value === "true",
            host:         ollamaHost.value ?? "http://localhost:11434",
            defaultModel: ollamaModel.value ?? "anu",
            source:       ollamaEnabled.source,
        },
        deployment: {
            vercelToken: {
                configured: !!vercelToken.value,
                source:     vercelToken.source,
            },
        },
        persistent: isRuntimeConfigPersistent(),
    };

    return Response.json(resp);
}

// ── POST /api/config ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<Response> {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (typeof body !== "object" || body === null) {
        return Response.json({ error: "Request body must be an object" }, { status: 400 });
    }

    const store = readStore();
    const updated: string[] = [];
    const rejected: string[] = [];

    // Accept { key, value } or { keys: { KEY: value } }
    const asRecord = body as Record<string, unknown>;
    const pairs: Record<string, string> = {};

    if (typeof asRecord.key === "string" && typeof asRecord.value === "string") {
        pairs[asRecord.key] = asRecord.value;
    } else if (typeof asRecord.keys === "object" && asRecord.keys !== null) {
        for (const [k, v] of Object.entries(asRecord.keys as Record<string, unknown>)) {
            if (typeof v === "string") pairs[k] = v;
        }
    } else {
        return Response.json({ error: "Provide { key, value } or { keys: { KEY: value } }" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(pairs)) {
        if (!ALLOWED_KEYS.has(key)) {
            rejected.push(key);
            continue;
        }
        if (value === "") {
            delete store[key];
        } else {
            store[key] = value;
        }
        updated.push(key);
    }

    writeStore(store);
    return Response.json({ ok: true, updated, rejected });
}

// ── DELETE /api/config?key=GROQ_API_KEY ───────────────────────────────────────

export async function DELETE(req: NextRequest): Promise<Response> {
    const key = new URL(req.url).searchParams.get("key");
    if (!key) return Response.json({ error: "key query param required" }, { status: 400 });
    if (!ALLOWED_KEYS.has(key)) return Response.json({ error: "Key not allowed" }, { status: 400 });

    const store = readStore();
    delete store[key];
    writeStore(store);
    return Response.json({ ok: true, deleted: key });
}
