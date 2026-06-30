// ============================================================================
// AN Dev Studio — /api/providers  (GET)
// Returns configured provider list without exposing API keys
// ============================================================================

import { ProviderManager } from "@/lib/ai/ProviderManager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
    const manager   = ProviderManager.getInstance();
    const statuses  = manager.getStatuses();

    return Response.json({
        providers: statuses,
        default:   process.env.DEFAULT_PROVIDER ?? "groq",
    });
}
