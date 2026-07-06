export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { addActivity, getActivities } from "@/lib/activityLog";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    let limit = DEFAULT_LIMIT;

    if (limitParam !== null) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, MAX_LIMIT);
      }
    }

    const { activities, total } = getActivities(limit);

    return NextResponse.json({ activities, total });
  } catch (err: unknown) {
    console.error("GET /api/activity error:", err);
    return NextResponse.json(
      { error: "Failed to read activity log" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("message" in body) ||
      !("agent" in body) ||
      !("status" in body) ||
      !("category" in body)
    ) {
      return NextResponse.json(
        { error: "Missing required fields: message, agent, status, category" },
        { status: 400 }
      );
    }

    const { message, agent, status, category } = body as Record<
      string,
      unknown
    >;

    if (
      typeof message !== "string" ||
      typeof agent !== "string" ||
      typeof status !== "string" ||
      typeof category !== "string"
    ) {
      return NextResponse.json(
        { error: "Fields message, agent, status, category must be strings" },
        { status: 400 }
      );
    }

    if (status !== "success" && status !== "warning" && status !== "danger") {
      return NextResponse.json(
        { error: 'status must be one of: "success", "warning", "danger"' },
        { status: 400 }
      );
    }

    const entry = addActivity({
      message,
      agent,
      status,
      category,
    });

    return NextResponse.json({ ok: true, entry }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/activity error:", err);
    return NextResponse.json(
      { error: "Failed to write activity log" },
      { status: 500 }
    );
  }
}
