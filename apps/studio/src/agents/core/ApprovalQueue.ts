// ============================================================================
// AN Dev Studio — Approval Queue
//
// Single choke point every agent action passes through. Agents call
// enqueue() and get back a pending request; nothing is written to disk or
// executed until a human calls approve() via the UI/API, at which point
// applyApproved() actually performs the write or runs the command.
//
// In-memory for now (process-lifetime only) — fine for a single-user local
// desktop app. If this needs to survive restarts later, swap the Map for a
// small file-backed or SQLite store behind the same interface.
// ============================================================================

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import type { ApprovalRequest, AgentAction, ProjectContext } from "./types";

const MAX_HISTORY = 500;

class ApprovalQueueImpl {
    private requests = new Map<string, ApprovalRequest>();
    private contexts = new Map<string, ProjectContext>();

    enqueue(projectId: string, agentPath: string, action: AgentAction, ctx: ProjectContext): ApprovalRequest {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const req: ApprovalRequest = {
            id,
            projectId,
            agentPath,
            action,
            status: "pending",
            createdAt: Date.now(),
        };
        this.requests.set(id, req);
        this.contexts.set(id, ctx);
        this.pruneHistory();
        return req;
    }

    list(projectId?: string): ApprovalRequest[] {
        const all = [...this.requests.values()].sort((a, b) => b.createdAt - a.createdAt);
        return projectId ? all.filter((r) => r.projectId === projectId) : all;
    }

    get(id: string): ApprovalRequest | undefined {
        return this.requests.get(id);
    }

    reject(id: string): ApprovalRequest | undefined {
        const req = this.requests.get(id);
        if (!req || req.status !== "pending") return req;
        req.status = "rejected";
        req.resolvedAt = Date.now();
        return req;
    }

    /**
     * Approve AND apply in one step — this is the only place file writes or
     * shell commands actually happen. Runs are best-effort: failures are
     * recorded on the request, not thrown, so the UI can surface them.
     */
    async approveAndApply(id: string): Promise<ApprovalRequest | undefined> {
        const req = this.requests.get(id);
        const ctx = this.contexts.get(id);
        if (!req || !ctx || req.status !== "pending") return req;

        req.status = "approved";

        try {
            if (req.action.kind === "file_write") {
                await this.applyFileWrite(req.action, ctx);
            } else {
                await this.applyShellCommand(req.action, ctx);
            }
            req.status = "applied";
        } catch (err) {
            req.status = "failed";
            req.error = err instanceof Error ? err.message : String(err);
        }

        req.resolvedAt = Date.now();
        return req;
    }

    private async applyFileWrite(action: Extract<AgentAction, { kind: "file_write" }>, ctx: ProjectContext): Promise<void> {
        const resolved = this.resolveSafePath(ctx.targetFolder, action.relativePath);
        fs.mkdirSync(path.dirname(resolved), { recursive: true });
        fs.writeFileSync(resolved, action.newContent, "utf-8");
    }

    private async applyShellCommand(action: Extract<AgentAction, { kind: "shell_command" }>, ctx: ProjectContext): Promise<void> {
        const cwd = this.resolveSafePath(ctx.targetFolder, action.cwd || ".");

        // Runs via the Docker sandbox executor when available (see
        // src/agents/sandbox/DockerSandbox.ts) so commands are isolated to
        // the project folder rather than running with full user permissions
        // on the host. Falls back to a direct host process only if Docker
        // isn't available, since local dev without Docker installed still
        // needs to be usable.
        const { runInSandbox, isDockerAvailable } = await import("../sandbox/DockerSandbox");

        if (await isDockerAvailable()) {
            await runInSandbox(action.command, cwd);
            return;
        }

        await new Promise<void>((resolve, reject) => {
            const child = spawn(action.command, {
                cwd,
                shell: true,
                windowsHide: true,
            });
            let stderr = "";
            child.stderr?.on("data", (d) => { stderr += d.toString(); });
            child.on("error", reject);
            child.on("exit", (code) => {
                if (code === 0) resolve();
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
        if (this.requests.size <= MAX_HISTORY) return;
        const sorted = [...this.requests.values()].sort((a, b) => a.createdAt - b.createdAt);
        for (const req of sorted.slice(0, this.requests.size - MAX_HISTORY)) {
            this.requests.delete(req.id);
            this.contexts.delete(req.id);
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
