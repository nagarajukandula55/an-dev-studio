// ============================================================================
// AN Dev Studio — /api/agents/approvals/[id]/approve  (POST)
// The ONLY route that actually causes a file write or shell command to run.
// ============================================================================

import { approvalQueue } from "@/agents/core/ApprovalQueue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
    const { id } = await params;
    const result = await approvalQueue.approveAndApply(id);
    if (!result) {
        return Response.json({ error: "Approval request not found" }, { status: 404 });
    }
    return Response.json({ approval: result });
}
