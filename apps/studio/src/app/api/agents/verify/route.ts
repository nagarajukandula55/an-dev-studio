// ============================================================================
// AN Dev Studio — /api/agents/verify
//
// GET  ?projectId=...            — last verify report + auto-approve flag for the project
// POST { projectId }             — runs one pass of the verify-and-fix loop
// PATCH { projectId, autoApprove } — toggles the per-project auto-approve setting (default OFF)
// ============================================================================

import { projectContextStore } from "@/agents/core/ProjectContextStore";
import { buildVerifier } from "@/agents/verify/BuildVerifier";
import { autoApproveStore } from "@/agents/verify/AutoApproveStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
    const projectId = new URL(req.url).searchParams.get("projectId");
    if (!projectId) {
        return Response.json({ error: "projectId query param is required" }, { status: 400 });
    }
    return Response.json({
        report: buildVerifier.getLastReport(projectId) ?? null,
        autoApprove: autoApproveStore.get(projectId),
    });
}

export async function POST(req: Request): Promise<Response> {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { projectId } = (body ?? {}) as { projectId?: unknown };
    if (typeof projectId !== "string" || !projectId.trim()) {
        return Response.json({ error: "projectId is required" }, { status: 400 });
    }

    const ctx = projectContextStore.get(projectId);
    if (!ctx) {
        return Response.json({ error: `Unknown projectId "${projectId}" — run a build first.` }, { status: 404 });
    }

    try {
        const report = await buildVerifier.run(ctx);
        return Response.json({ report });
    } catch (err) {
        return Response.json(
            { error: `Verify failed: ${err instanceof Error ? err.message : String(err)}` },
            { status: 500 },
        );
    }
}

export async function PATCH(req: Request): Promise<Response> {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { projectId, autoApprove } = (body ?? {}) as { projectId?: unknown; autoApprove?: unknown };
    if (typeof projectId !== "string" || !projectId.trim()) {
        return Response.json({ error: "projectId is required" }, { status: 400 });
    }
    if (typeof autoApprove !== "boolean") {
        return Response.json({ error: "autoApprove must be a boolean" }, { status: 400 });
    }

    autoApproveStore.set(projectId, autoApprove);
    return Response.json({ projectId, autoApprove });
}
