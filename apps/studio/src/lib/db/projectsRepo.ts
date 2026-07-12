// ============================================================================
// AN Dev Studio — Projects repository (SQLite-backed)
//
// Backs ProjectContextStore (projectId -> ProjectContext lookup) and the
// per-project auto-approve toggle used by BuildVerifier. Replaces the
// in-memory globalThis Maps used before Phase 4 — both now survive a
// server restart.
// ============================================================================

import { db } from "./connection";
import type { Platform, ProjectContext } from "@/agents/core/types";

interface ProjectRow {
    project_id: string;
    target_folder: string;
    platform: string;
    prompt: string;
    auto_approve: number;
}

/** Inserts the project if new, or refreshes its target folder/platform/prompt if it already exists (re-running a build on the same project). */
export function upsertProjectContext(ctx: ProjectContext): void {
    const now = Date.now();
    db.prepare(
        `INSERT INTO projects (project_id, target_folder, platform, prompt, auto_approve, created_at, updated_at)
         VALUES (@projectId, @targetFolder, @platform, @prompt, 0, @now, @now)
         ON CONFLICT(project_id) DO UPDATE SET
            target_folder = excluded.target_folder,
            platform = excluded.platform,
            prompt = excluded.prompt,
            updated_at = excluded.updated_at`,
    ).run({ projectId: ctx.projectId, targetFolder: ctx.targetFolder, platform: ctx.platform, prompt: ctx.prompt, now });
}

export function getProjectContext(projectId: string): ProjectContext | undefined {
    const row = db
        .prepare(`SELECT project_id, target_folder, platform, prompt, auto_approve FROM projects WHERE project_id = ?`)
        .get(projectId) as ProjectRow | undefined;
    if (!row) return undefined;
    return { projectId: row.project_id, targetFolder: row.target_folder, platform: row.platform as Platform, prompt: row.prompt };
}

export function getAutoApprove(projectId: string): boolean {
    const row = db.prepare(`SELECT auto_approve FROM projects WHERE project_id = ?`).get(projectId) as
        | { auto_approve: number }
        | undefined;
    return row ? row.auto_approve === 1 : false;
}

/** Tolerates being called before the project's ProjectContext has ever been upserted (e.g. toggled before the first build/verify run). */
export function setAutoApprove(projectId: string, value: boolean): void {
    const now = Date.now();
    db.prepare(
        `INSERT OR IGNORE INTO projects (project_id, target_folder, platform, prompt, auto_approve, created_at, updated_at)
         VALUES (?, '', 'web', '', ?, ?, ?)`,
    ).run(projectId, value ? 1 : 0, now, now);
    db.prepare(`UPDATE projects SET auto_approve = ?, updated_at = ? WHERE project_id = ?`).run(value ? 1 : 0, now, projectId);
}
