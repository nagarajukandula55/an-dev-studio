export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export type ProjectType =
  | "website"
  | "mobile-app"
  | "api"
  | "desktop-app"
  | "chrome-extension"
  | "cli"
  | "library"
  | "saas"
  | "other";

export type ProjectStatus =
  | "planning"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  techStack: string[];
  status: ProjectStatus;
  repoUrl?: string;
  deployUrl?: string;
  createdAt: string;
  updatedAt: string;
  tasksTotal: number;
  tasksCompleted: number;
  color: string;
}

const PROJECTS_FILE = path.join(process.cwd(), "config", "projects.json");

const COLOR_PALETTE = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#a855f7", // purple
  "#10b981", // emerald
];

function ensureConfigDir(): void {
  const configDir = path.dirname(PROJECTS_FILE);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

function readProjects(): Project[] {
  ensureConfigDir();
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2), "utf-8");
    return [];
  }
  const raw = fs.readFileSync(PROJECTS_FILE, "utf-8");
  try {
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

function writeProjects(projects: Project[]): void {
  ensureConfigDir();
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function assignColor(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

// GET /api/projects
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") as ProjectStatus | null;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    let projects = readProjects();

    if (statusFilter) {
      projects = projects.filter((p) => p.status === statusFilter);
    }

    const total = projects.length;

    if (limit !== undefined && !isNaN(limit) && limit > 0) {
      projects = projects.slice(0, limit);
    }

    return NextResponse.json({ projects, total });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to read projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { name, description, type, techStack, repoUrl, deployUrl } = body as {
      name?: string;
      description?: string;
      type?: ProjectType;
      techStack?: string[];
      repoUrl?: string;
      deployUrl?: string;
    };

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }
    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }
    const validTypes: ProjectType[] = [
      "website",
      "mobile-app",
      "api",
      "desktop-app",
      "chrome-extension",
      "cli",
      "library",
      "saas",
      "other",
    ];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const projects = readProjects();
    const now = new Date().toISOString();

    const newProject: Project = {
      id: generateId(),
      name: name.trim(),
      description: description.trim(),
      type,
      techStack: Array.isArray(techStack) ? techStack : [],
      status: "planning",
      ...(repoUrl ? { repoUrl } : {}),
      ...(deployUrl ? { deployUrl } : {}),
      createdAt: now,
      updatedAt: now,
      tasksTotal: 0,
      tasksCompleted: 0,
      color: assignColor(projects.length),
    };

    projects.push(newProject);
    writeProjects(projects);

    return NextResponse.json({ ok: true, project: newProject }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { id, ...updates } = body as { id?: string } & Partial<Project>;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "id is required in request body" },
        { status: 400 }
      );
    }

    const projects = readProjects();
    const index = projects.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: `Project with id "${id}" not found` },
        { status: 404 }
      );
    }

    const allowedFields: (keyof Project)[] = [
      "name",
      "description",
      "type",
      "techStack",
      "status",
      "repoUrl",
      "deployUrl",
      "tasksTotal",
      "tasksCompleted",
      "color",
    ];

    const sanitized: Partial<Project> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        (sanitized as Record<string, unknown>)[key] = (updates as Record<string, unknown>)[key];
      }
    }

    projects[index] = {
      ...projects[index],
      ...sanitized,
      id: projects[index].id,
      createdAt: projects[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    writeProjects(projects);

    return NextResponse.json({ ok: true, project: projects[index] });
  } catch (error) {
    console.error("PATCH /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects?id=xxx
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query param is required" },
        { status: 400 }
      );
    }

    const projects = readProjects();
    const index = projects.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: `Project with id "${id}" not found` },
        { status: 404 }
      );
    }

    const [deleted] = projects.splice(index, 1);
    writeProjects(projects);

    return NextResponse.json({ ok: true, project: deleted });
  } catch (error) {
    console.error("DELETE /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
