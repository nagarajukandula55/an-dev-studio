// ============================================================================
// AN Dev Studio — Agent run records repository (SQLite-backed)
//
// One row per GlobalOrchestrator.run() call: the plan rationale and the
// full AgentResult[] it produced, for history/debugging across restarts.
// Not read back by any API route yet — this is the persistence half of
// Phase 4; a history UI can query it later without a schema change.
// ============================================================================

import { db } from "./connection";
import type { AgentResult } from "@/agents/core/types";

export interface AgentRunRecord {
    id: string;
    projectId: string;
    rationale: string;
    results: AgentResult[];
    success: boolean;
    createdAt: number;
}

export function insertAgentRun(record: AgentRunRecord): void {
    db.prepare(
        `INSERT INTO agent_runs (id, project_id, rationale, results_json, success, created_at)
         VALUES (@id, @projectId, @rationale, @resultsJson, @success, @createdAt)`,
    ).run({
        id: record.id,
        projectId: record.projectId,
        rationale: record.rationale,
        resultsJson: JSON.stringify(record.results),
        success: record.success ? 1 : 0,
        createdAt: record.createdAt,
    });
}

export function listAgentRuns(projectId: string): AgentRunRecord[] {
    const rows = db.prepare(`SELECT * FROM agent_runs WHERE project_id = ? ORDER BY created_at DESC`).all(projectId) as {
        id: string;
        project_id: string;
        rationale: string | null;
        results_json: string;
        success: number;
        created_at: number;
    }[];

    return rows.map((r) => ({
        id: r.id,
        projectId: r.project_id,
        rationale: r.rationale ?? "",
        results: JSON.parse(r.results_json) as AgentResult[],
        success: r.success === 1,
        createdAt: r.created_at,
    }));
}
