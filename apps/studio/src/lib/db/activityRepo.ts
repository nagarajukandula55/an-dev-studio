// ============================================================================
// AN Dev Studio — Activity log repository (SQLite-backed)
//
// Backs lib/activityLog.ts, replacing the config/activity.json file store
// so activity history survives a restart the same way approvals do.
// ============================================================================

import { db } from "./connection";

export interface ActivityEntry {
    id: string;
    message: string;
    time: string;
    agent: string;
    status: "success" | "warning" | "danger";
    category: string;
}

interface ActivityRow {
    id: string;
    message: string;
    time: string;
    agent: string;
    status: string;
    category: string;
}

const MAX_ENTRIES = 100;

function rowToEntry(row: ActivityRow): ActivityEntry {
    return { id: row.id, message: row.message, time: row.time, agent: row.agent, status: row.status as ActivityEntry["status"], category: row.category };
}

export function insertActivity(entry: ActivityEntry): void {
    db.prepare(
        `INSERT INTO activity_log (id, message, time, agent, status, category) VALUES (@id, @message, @time, @agent, @status, @category)`,
    ).run(entry);

    // Keep only the newest MAX_ENTRIES rows — same cap the old JSON store enforced.
    db.prepare(
        `DELETE FROM activity_log WHERE id NOT IN (SELECT id FROM activity_log ORDER BY time DESC LIMIT ?)`,
    ).run(MAX_ENTRIES);
}

export function listActivities(limit: number): { activities: ActivityEntry[]; total: number } {
    const total = (db.prepare(`SELECT COUNT(*) as c FROM activity_log`).get() as { c: number }).c;
    const rows = db.prepare(`SELECT * FROM activity_log ORDER BY time DESC LIMIT ?`).all(limit) as ActivityRow[];
    return { activities: rows.map(rowToEntry), total };
}

export function listActivitiesSince(sinceIso: string | null): ActivityEntry[] {
    const rows = (
        sinceIso
            ? (db.prepare(`SELECT * FROM activity_log WHERE time > ? ORDER BY time DESC`).all(sinceIso) as ActivityRow[])
            : (db.prepare(`SELECT * FROM activity_log ORDER BY time DESC`).all() as ActivityRow[])
    );
    return rows.map(rowToEntry);
}
