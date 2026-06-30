export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ACTIVITY_FILE = path.join(process.cwd(), "config", "activity.json");
const MAX_ENTRIES = 100;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

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

export function addActivity(
  entry: Omit<ActivityEntry, "id" | "time">
): ActivityEntry {
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

    const activities = readActivities();
    const sliced = activities.slice(0, limit);

    return NextResponse.json({
      activities: sliced,
      total: activities.length,
    });
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
