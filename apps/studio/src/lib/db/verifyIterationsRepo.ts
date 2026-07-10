// ============================================================================
// AN Dev Studio — Verify-loop iterations repository (SQLite-backed)
//
// One row per BuildVerifier iteration, so a project's verify history (which
// commands ran, their status, what the Fixer diagnosed) survives a restart
// instead of living only in BuildVerifier's in-memory last-report cache.
// ============================================================================

import { db } from "./connection";
import type { VerifyIterationRecord } from "@/agents/verify/BuildVerifier";

export function insertVerifyIteration(projectId: string, record: VerifyIterationRecord): void {
    db.prepare(
        `INSERT INTO verify_iterations (id, project_id, iteration, commands_json, fixer_diagnosis, fix_request_ids_json, created_at)
         VALUES (@id, @projectId, @iteration, @commandsJson, @fixerDiagnosis, @fixRequestIdsJson, @createdAt)`,
    ).run({
        id: `${projectId}-${record.iteration}-${Date.now()}`,
        projectId,
        iteration: record.iteration,
        commandsJson: JSON.stringify(record.commands),
        fixerDiagnosis: record.fixerDiagnosis ?? null,
        fixRequestIdsJson: record.fixRequestIds ? JSON.stringify(record.fixRequestIds) : null,
        createdAt: Date.now(),
    });
}

export function listVerifyIterations(projectId: string): VerifyIterationRecord[] {
    const rows = db
        .prepare(`SELECT * FROM verify_iterations WHERE project_id = ? ORDER BY created_at ASC`)
        .all(projectId) as {
        iteration: number;
        commands_json: string;
        fixer_diagnosis: string | null;
        fix_request_ids_json: string | null;
    }[];

    return rows.map((r) => ({
        iteration: r.iteration,
        commands: JSON.parse(r.commands_json),
        fixerDiagnosis: r.fixer_diagnosis ?? undefined,
        fixRequestIds: r.fix_request_ids_json ? JSON.parse(r.fix_request_ids_json) : undefined,
    }));
}
