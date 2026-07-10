// ============================================================================
// AN Dev Studio — Activity Log (shared)
//
// File-backed activity log used by:
//  - /api/activity (the route the dashboard polls)
//  - the agent framework itself (GlobalOrchestrator, the core-team agents,
//    ApprovalQueue) so real agent runs actually produce entries, instead of
//    the dashboard/notification bell showing a static hardcoded placeholder.
//
// Extracted out of the route handler so non-route code (the orchestrators)
// can log activity without pulling in Next.js request/response types.
// ============================================================================

import fs from "fs";
import path from "path";

const ACTIVITY_FILE = path.join(process.cwd(), "config", "activity.json");
const MAX_ENTRIES = 100;

export interface ActivityEntry {
    id: string;
    message: string;
    time: string;
    agent: string;
    status: "success" | "warning" | "danger";
    category: string;
}

function readActivities(): ActivityEntry[] {
    try {
        const raw = fs.readFileSync(ACTIVITY_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed as ActivityEntry[];
        }
        return [];
    } catch (err: unknown) {
        if (
            typeof err === "object" &&
            err !== null &&
            "code" in err &&
            (err as NodeJS.ErrnoException).code === "ENOENT"
        ) {
            return [];
        }
        throw err;
    }
}

function writeActivities(activities: ActivityEntry[]): void {
    const dir = path.dirname(ACTIVITY_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(activities, null, 2), "utf-8");
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addActivity(entry: Omit<ActivityEntry, "id" | "time">): ActivityEntry {
    const activities = readActivities();

    const newEntry: ActivityEntry = {
        id: generateId(),
        message: entry.message,
        time: new Date().toISOString(),
        agent: entry.agent,
        status: entry.status,
        category: entry.category,
    };

    activities.unshift(newEntry);

    if (activities.length > MAX_ENTRIES) {
        activities.splice(MAX_ENTRIES);
    }

    writeActivities(activities);

    return newEntry;
}

export function getActivities(limit: number): { activities: ActivityEntry[]; total: number } {
    const activities = readActivities();
    return { activities: activities.slice(0, limit), total: activities.length };
}

/** Activities added since a given timestamp (ISO string) — used to derive an unread notification count without a separate "read" tracking system. */
export function getActivitiesSince(sinceIso: string | null): ActivityEntry[] {
    const all = readActivities();
    if (!sinceIso) return all;
    const sinceMs = Date.parse(sinceIso);
    if (Number.isNaN(sinceMs)) return all;
    return all.filter((a) => Date.parse(a.time) > sinceMs);
}
