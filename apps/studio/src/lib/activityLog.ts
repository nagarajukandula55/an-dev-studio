// ============================================================================
// AN Dev Studio — Activity Log (shared)
//
// Used by:
//  - /api/activity (the route the dashboard polls)
//  - the agent framework itself (GlobalOrchestrator, the core-team agents,
//    ApprovalQueue) so real agent runs actually produce entries, instead of
//    the dashboard/notification bell showing a static hardcoded placeholder.
//
// Backed by SQLite (lib/db/activityRepo.ts) since Phase 4 — replaces the
// config/activity.json file store so history survives a restart the same
// way approvals do. Public function signatures unchanged.
//
// Extracted out of the route handler so non-route code (the orchestrators)
// can log activity without pulling in Next.js request/response types.
// ============================================================================

import { insertActivity, listActivities, listActivitiesSince, type ActivityEntry } from "@/lib/db/activityRepo";

export type { ActivityEntry };

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addActivity(entry: Omit<ActivityEntry, "id" | "time">): ActivityEntry {
    const newEntry: ActivityEntry = {
        id: generateId(),
        message: entry.message,
        time: new Date().toISOString(),
        agent: entry.agent,
        status: entry.status,
        category: entry.category,
    };
    insertActivity(newEntry);
    return newEntry;
}

export function getActivities(limit: number): { activities: ActivityEntry[]; total: number } {
    return listActivities(limit);
}

/** Activities added since a given timestamp (ISO string) — used to derive an unread notification count without a separate "read" tracking system. */
export function getActivitiesSince(sinceIso: string | null): ActivityEntry[] {
    if (sinceIso !== null && Number.isNaN(Date.parse(sinceIso))) {
        return listActivitiesSince(null);
    }
    return listActivitiesSince(sinceIso);
}
