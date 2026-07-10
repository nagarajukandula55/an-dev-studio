// ============================================================================
// AN Dev Studio — Approval Queue
//
// Single choke point every agent action passes through. Agents call
// enqueue() and get back a pending request; nothing is written to disk or
// executed until a human calls approve() via the UI/API, at which point
// approveAndApply() actually performs the write or runs the command.
//
// Backed by SQLite (lib/db/approvalsRepo.ts + projectsRepo.ts) since
// Phase 4 — full approval history and the projects they belong to survive a
// server restart. This class's public interface is unchanged from the
// in-memory version; only the storage underneath swapped.
// ============================================================================

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import type { ApprovalRequest, AgentAction, ProjectContext } from "./types";
import { countApprovals, deleteOldestApprovals, getApproval, insertApproval, listApprovals, updateApproval } from "@/lib/db/approvalsRepo";
import { getProjectContext, upsertProjectContext } from "@/lib/db/projectsRepo";

const MAX_HISTORY = 500;

class ApprovalQueueImpl {
    enqueue(projectId: string, agentPath: string, action: AgentAction, ctx: ProjectContext): ApprovalRequest {
        const req: ApprovalRequest = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
            projectId,
            agentPath,
            action,
            status: "pending",
            createdAt: Date.now(),
        };
        upsertProjectContext(ctx);
        insertApproval(req);
        this.pruneHistory();
        return req;
    }

    list(projectId?: string): ApprovalRequest[] {
        return listApprovals(projectId);
    }

    get(id: string): ApprovalRequest | undefined {
        return getApproval(id);
    }

    reject(id: string): ApprovalRequest | undefined {
        const req = getApproval(id);
        if (!req || req.status !== "pending") return req;
        req.status = "rejected";
        req.resolvedAt = Date.now();
        updateApproval(req);
        return req;
    }

    /**
     * Approve AND apply in one step — this is the only place file writes or
     * shell commands actually happen. Runs are best-effort: failures are
     * recorded on the request, not thrown, so the UI can surface them.
     */
    async approveAndApply(id: string): Promise<ApprovalRequest | undefined> {
        const req = getApproval(id);
        const ctx = req ? getProjectContext(req.projectId) : undefined;
        if (!req || !ctx || req.status !== "pending") return req;

        req.status = "approved";

        try {
            if (req.action.kind === "file_write") {
                await this.applyFileWrite(req.action, ctx);
            } else {
                req.output = await this.applyShellCommand(req.action, ctx);
            }
            req.status = "applied";
        } catch (err) {
            req.status = "failed";
            req.error = err instanceof Error ? err.message : String(err);
        }

        req.resolvedAt = Date.now();
        updateApproval(req);
        return req;
    }

    private async applyFileWrite(action: Extract<AgentAction, { kind: "file_write" }>, ctx: ProjectContext): Promise<void> {
        const resolved = this.resolveSafePath(ctx.targetFolder, action.relativePath);
        fs.mkdirSync(path.dirname(resolved), { recursive: true });
        fs.writeFileSync(resolved, action.newContent, "utf-8");
    }

    /** Runs the command and returns its captured stdout+stderr, or throws (with output attached to the message) on non-zero exit. */
    private async applyShellCommand(action: Extract<AgentAction, { kind: "shell_command" }>, ctx: ProjectContext): Promise<string> {
        const cwd = this.resolveSafePath(ctx.targetFolder, action.cwd || ".");

        // Runs via the Docker sandbox executor when available (see
        // src/agents/sandbox/DockerSandbox.ts) so commands are isolated to
        // the project folder rather than running with full user permissions
        // on the host. Falls back to a direct host process only if Docker
        // isn't available, since local dev without Docker installed still
        // needs to be usable.
        const { runInSandbox, isDockerAvailable } = await import("../sandbox/DockerSandbox");

        if (await isDockerAvailable()) {
            const result = await runInSandbox(action.command, cwd);
            const combined = `${result.stdout}${result.stderr}`;
            if (result.code !== 0) {
                throw new Error(`Command exited with code ${result.code}: ${result.stderr.slice(0, 2000)}`);
            }
            return combined;
        }

        return new Promise<string>((resolve, reject) => {
            const child = spawn(action.command, {
                cwd,
                shell: true,
                windowsHide: true,
            });
            let stdout = "";
            let stderr = "";
            child.stdout?.on("data", (d) => { stdout += d.toString(); });
            child.stderr?.on("data", (d) => { stderr += d.toString(); });
            child.on("error", reject);
            child.on("exit", (code) => {
                if (code === 0) resolve(`${stdout}${stderr}`);
                else reject(new Error(`Command exited with code ${code}: ${stderr.slice(0, 2000)}`));
            });
        });
    }

    /** Prevents a proposed relativePath from escaping the project folder (e.g. "../../etc/passwd"). */
    private resolveSafePath(targetFolder: string, relativePath: string): string {
        const resolved = path.resolve(targetFolder, relativePath);
        const base = path.resolve(targetFolder);
        if (resolved !== base && !resolved.startsWith(base + path.sep)) {
            throw new Error(`Refusing to write outside the project folder: ${relativePath}`);
        }
        return resolved;
    }

    private pruneHistory(): void {
        const count = countApprovals();
        if (count > MAX_HISTORY) {
            deleteOldestApprovals(count - MAX_HISTORY);
        }
    }
}

// Singleton — one queue per server process, same pattern as ProviderManager.
declare global {
    // eslint-disable-next-line no-var
    var __anDevStudioApprovalQueue: ApprovalQueueImpl | undefined;
}

export const approvalQueue: ApprovalQueueImpl =
    globalThis.__anDevStudioApprovalQueue ?? (globalThis.__anDevStudioApprovalQueue = new ApprovalQueueImpl());
