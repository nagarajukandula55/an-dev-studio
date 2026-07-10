// ============================================================================
// AN Dev Studio — Core-Team Proposal Helpers
//
// Every core-team agent affects the world only by enqueuing a FileWriteAction
// or ShellCommandAction on the ApprovalQueue — same rule as the old
// micro-agents, just shared here so the six agents don't each re-implement
// path resolution / stripping code fences.
// ============================================================================

import fs from "fs";
import path from "path";
import type { ProjectContext } from "../core/types";
import { approvalQueue } from "../core/ApprovalQueue";

export function stripCodeFence(text: string): string {
    const trimmed = text.trim();
    const fenceMatch = trimmed.match(/^```[a-zA-Z0-9]*\s*([\s\S]*?)\s*```$/);
    return fenceMatch ? fenceMatch[1] : trimmed;
}

export function readIfExists(targetFolder: string, relativePath: string): string {
    try {
        return fs.readFileSync(path.join(targetFolder, relativePath), "utf-8");
    } catch {
        return "";
    }
}

export function proposeFileWrite(
    ctx: ProjectContext,
    agentPath: string,
    relativePath: string,
    rawContent: string,
    reason: string,
): string {
    const newContent = stripCodeFence(rawContent);
    const previousContent = readIfExists(ctx.targetFolder, relativePath);

    const request = approvalQueue.enqueue(
        ctx.projectId,
        agentPath,
        { kind: "file_write", relativePath, newContent, previousContent, reason },
        ctx,
    );
    return request.id;
}

export function proposeCommand(
    ctx: ProjectContext,
    agentPath: string,
    command: string,
    cwd: string,
    reason: string,
): string {
    const cleanCommand = stripCodeFence(command).replace(/\n+/g, " ").trim();
    const request = approvalQueue.enqueue(ctx.projectId, agentPath, { kind: "shell_command", command: cleanCommand, cwd, reason }, ctx);
    return request.id;
}
