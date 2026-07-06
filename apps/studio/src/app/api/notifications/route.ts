// ============================================================================
// AN Dev Studio — /api/notifications  (GET)
// Real notifications, derived from the same activity log the dashboard's
// activity feed reads from — not a hardcoded placeholder count. Pass
// ?since=<ISO timestamp> to get only entries newer than the client's
// last-seen marker (the client persists that marker itself; the server
// stays stateless about "read" status).
// ============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getActivitiesSince } from "@/lib/activityLog";

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const since = new URL(request.url).searchParams.get("since");
        const activities = getActivitiesSince(since);

        return NextResponse.json({
            notifications: activities.slice(0, 20),
            unreadCount: activities.length,
        });
    } catch (err: unknown) {
        console.error("GET /api/notifications error:", err);
        return NextResponse.json({ error: "Failed to read notifications" }, { status: 500 });
    }
}
