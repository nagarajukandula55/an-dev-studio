// ============================================================================
// AN Dev Studio — /api/agents/approvals  (GET)
// Lists pending/resolved approval requests, optionally filtered by project.
// ============================================================================

import { approvalQueue } from "@/agents/core/ApprovalQueue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
    const projectId = new URL(req.url).searchParams.get("projectId") ?? undefined;
    return Response.json({ approvals: approvalQueue.list(projectId) });
}
