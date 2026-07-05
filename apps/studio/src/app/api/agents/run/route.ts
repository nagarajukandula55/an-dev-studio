// ============================================================================
// AN Dev Studio — /api/agents/run  (POST)
// Kicks off the Global Orchestrator for a new build request. Runs
// synchronously and returns once all mini-orchestrators have produced their
// proposals (which sit in the ApprovalQueue awaiting human review) — it does
// NOT write anything to disk or run anything itself.
// ============================================================================

import fs from "fs";
import { globalOrchestrator } from "@/agents/core/GlobalOrchestrator";
import type { Platform, ProjectContext } from "@/agents/core/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_PLATFORMS: Platform[] = ["web", "windows", "android", "ios", "macos"];

export async function POST(req: Request): Promise<Response> {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { prompt, platform, targetFolder } = (body ?? {}) as {
        prompt?: unknown;
        platform?: unknown;
        targetFolder?: unknown;
    };

    if (typeof prompt !== "string" || !prompt.trim()) {
        return Response.json({ error: "prompt is required" }, { status: 400 });
    }
    if (typeof platform !== "string" || !VALID_PLATFORMS.includes(platform as Platform)) {
        return Response.json({ error: `platform must be one of: ${VALID_PLATFORMS.join(", ")}` }, { status: 400 });
    }
    if (typeof targetFolder !== "string" || !targetFolder.trim()) {
        return Response.json({ error: "targetFolder is required" }, { status: 400 });
    }

    try {
        fs.mkdirSync(targetFolder, { recursive: true });
    } catch (err) {
        return Response.json(
            { error: `Could not create/access targetFolder: ${err instanceof Error ? err.message : String(err)}` },
            { status: 400 },
        );
    }

    const ctx: ProjectContext = {
        projectId: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        prompt,
        platform: platform as Platform,
        targetFolder,
    };

    try {
        const { plan, results } = await globalOrchestrator.run(ctx);
        return Response.json({ projectId: ctx.projectId, plan, results });
    } catch (err) {
        return Response.json(
            { error: `Orchestration failed: ${err instanceof Error ? err.message : String(err)}` },
            { status: 500 },
        );
    }
}
