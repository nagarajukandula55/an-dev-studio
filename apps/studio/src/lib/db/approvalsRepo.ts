// ============================================================================
// AN Dev Studio — Approvals repository (SQLite-backed)
//
// Backs ApprovalQueue's storage. ApprovalQueue keeps its exact public
// interface (enqueue/list/get/reject/approveAndApply) — only the storage
// underneath swapped from an in-memory Map to this table, so pending
// approvals and their full history survive a server restart.
// ============================================================================

import { db } from "./connection";
import type { AgentAction, ApprovalRequest, ApprovalStatus } from "@/agents/core/types";

interface ApprovalRow {
    id: string;
    project_id: string;
    agent_path: string;
    action_json: string;
    status: string;
    created_at: number;
    resolved_at: number | null;
    error: string | null;
    output: string | null;
}

function rowToRequest(row: ApprovalRow): ApprovalRequest {
    return {
        id: row.id,
        projectId: row.project_id,
        agentPath: row.agent_path,
        action: JSON.parse(row.action_json) as AgentAction,
        status: row.status as ApprovalStatus,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at ?? undefined,
        error: row.error ?? undefined,
        output: row.output ?? undefined,
    };
}

export function insertApproval(req: ApprovalRequest): void {
    db.prepare(
        `INSERT INTO approvals (id, project_id, agent_path, action_json, status, created_at, resolved_at, error, output)
         VALUES (@id, @projectId, @agentPath, @actionJson, @status, @createdAt, @resolvedAt, @error, @output)`,
    ).run({
        id: req.id,
        projectId: req.projectId,
        agentPath: req.agentPath,
        actionJson: JSON.stringify(req.action),
        status: req.status,
        createdAt: req.createdAt,
        resolvedAt: req.resolvedAt ?? null,
        error: req.error ?? null,
        output: req.output ?? null,
    });
}

export function updateApproval(req: ApprovalRequest): void {
    db.prepare(
        `UPDATE approvals SET status = @status, resolved_at = @resolvedAt, error = @error, output = @output WHERE id = @id`,
    ).run({
        id: req.id,
        status: req.status,
        resolvedAt: req.resolvedAt ?? null,
        error: req.error ?? null,
        output: req.output ?? null,
    });
}

export function getApproval(id: string): ApprovalRequest | undefined {
    const row = db.prepare(`SELECT * FROM approvals WHERE id = ?`).get(id) as ApprovalRow | undefined;
    return row ? rowToRequest(row) : undefined;
}

export function listApprovals(projectId?: string): ApprovalRequest[] {
    const rows = (
        projectId
            ? db.prepare(`SELECT * FROM approvals WHERE project_id = ? ORDER BY created_at DESC`).all(projectId)
            : db.prepare(`SELECT * FROM approvals ORDER BY created_at DESC`).all()
    ) as ApprovalRow[];
    return rows.map(rowToRequest);
}

export function countApprovals(): number {
    return (db.prepare(`SELECT COUNT(*) as c FROM approvals`).get() as { c: number }).c;
}

/** Deletes the oldest `count` approvals by created_at — backs ApprovalQueue's MAX_HISTORY pruning. */
export function deleteOldestApprovals(count: number): void {
    if (count <= 0) return;
    db.prepare(`DELETE FROM approvals WHERE id IN (SELECT id FROM approvals ORDER BY created_at ASC LIMIT ?)`).run(count);
}
