export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Project } from "../route";

const PROJECTS_FILE = path.join(process.cwd(), "config", "projects.json");

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

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const projects = readProjects();
    const project = projects.find((p) => p.id === id);

    if (!project) {
      return NextResponse.json(
        { error: `Project with id "${id}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to read project" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id]
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body = await request.json();

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

    const updates = body as Partial<Project>;
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
    console.error("PATCH /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
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
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
