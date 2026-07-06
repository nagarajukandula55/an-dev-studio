// ============================================================================
// AN Dev Studio — /api/agents/status  (GET)
// Live status for the entire agent org chart: Global Orchestrator -> every
// Mini-Orchestrator -> every Micro-Agent. The Builder dashboard polls this
// to render a real, live-updating org chart rather than a static list.
// ============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { agentStatusRegistry } from "@/agents/core/AgentStatusRegistry";
import { registerAllAgents } from "@/agents/core/GlobalOrchestrator";

export async function GET(): Promise<Response> {
    // Ensures the full org chart is registered (as "idle") even if nothing
    // has run yet this server lifetime, so the dashboard never shows an
    // empty/partial tree.
    registerAllAgents();

    const entries = agentStatusRegistry.list();

    return Response.json({
        global: entries.find((e) => e.kind === "global"),
        minis: entries.filter((e) => e.kind === "mini"),
        micros: entries.filter((e) => e.kind === "micro"),
    });
}
