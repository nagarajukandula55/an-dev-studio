// ============================================================================
// AN Dev Studio — Agent Framework Core Types
//
// Hierarchy: GlobalOrchestrator -> six core-team agents (Planner, Scaffolder,
// Implementer, Reviewer, Fixer, Deployer — see ../core-team/**), all sharing
// one ProjectManifest (../manifest/ProjectManifest.ts) so multi-file output
// stays coherent.
//
// Every action an agent wants to take on real files or a real shell is
// represented as an ApprovalRequest and MUST go through the approval queue
// (src/agents/core/ApprovalQueue.ts) before it is applied. Agents never
// write to disk or run commands directly — see FileWriteAction /
// ShellCommandAction below.
// ============================================================================

export type Platform = "web" | "windows" | "android" | "ios" | "macos";

export interface ProjectContext {
    /** Absolute path on the user's machine where this project lives. */
    targetFolder: string;
    platform: Platform;
    /** The user's original build request, e.g. "build me a todo app". */
    prompt: string;
    projectId: string;
}

// ── Approval-gated actions ──────────────────────────────────────────────────
// These are the ONLY two ways an agent can affect the outside world, and
// both require human approval before being applied.

export interface FileWriteAction {
    kind: "file_write";
    /** Path relative to ProjectContext.targetFolder. */
    relativePath: string;
    /** Full new file contents (agents propose whole-file contents, not patches — simpler to diff and reason about). */
    newContent: string;
    /** Empty string if the file doesn't exist yet. */
    previousContent: string;
    reason: string;
}

export interface ShellCommandAction {
    kind: "shell_command";
    /** The literal command to run, shown verbatim to the user before approval. */
    command: string;
    /** Working directory, relative to ProjectContext.targetFolder. */
    cwd: string;
    reason: string;
}

export type AgentAction = FileWriteAction | ShellCommandAction;

export type ApprovalStatus = "pending" | "approved" | "rejected" | "applied" | "failed";

export interface ApprovalRequest {
    id: string;
    projectId: string;
    agentPath: string; // e.g. "ui.component-builder" for display/audit trail
    action: AgentAction;
    status: ApprovalStatus;
    createdAt: number;
    resolvedAt?: number;
    error?: string;
}

// ── Agent results ────────────────────────────────────────────────────────────

export interface AgentResult {
    taskId: string;
    /** Approval requests this task generated (may be empty if it only did read-only reasoning). */
    approvalRequestIds: string[];
    summary: string;
    success: boolean;
    error?: string;
}
