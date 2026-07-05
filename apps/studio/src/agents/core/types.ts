// ============================================================================
// AN Dev Studio — Agent Framework Core Types
//
// Hierarchy: GlobalOrchestrator -> MiniOrchestrator (one per domain/platform)
// -> MicroAgent (one per narrow, single-responsibility task).
//
// Every action a micro-agent wants to take on real files or a real shell is
// represented as an ApprovalRequest and MUST go through the approval queue
// (src/agents/core/ApprovalQueue.ts) before it is applied. Agents never
// write to disk or run commands directly — see FileWriteAgentAction /
// ShellCommandAgentAction below.
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

// ── Agent hierarchy ──────────────────────────────────────────────────────────

export interface AgentTask {
    id: string;
    description: string;
    /** Free-form input the agent needs, e.g. { componentName: "LoginForm" }. */
    input: Record<string, unknown>;
}

export interface AgentResult {
    taskId: string;
    /** Approval requests this task generated (may be empty if it only did read-only reasoning). */
    approvalRequestIds: string[];
    summary: string;
    success: boolean;
    error?: string;
}

/**
 * A MicroAgent owns exactly one narrow responsibility (e.g. "write a single
 * React component", "write a single API route", "write one test file").
 * It proposes actions via the ApprovalQueue rather than touching disk itself.
 */
export interface MicroAgent {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    run(task: AgentTask, ctx: ProjectContext): Promise<AgentResult>;
}

/**
 * A MiniOrchestrator owns one domain (UI, Backend, Database, Testing,
 * DevOps) or one platform (Web, Windows, Android, iOS, macOS) or one
 * cross-cutting concern (Marketing, Automation). It decomposes a task handed
 * down from the GlobalOrchestrator into smaller tasks for its own
 * micro-agents.
 */
export interface MiniOrchestrator {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly microAgents: MicroAgent[];
    /** Whether this mini-orchestrator can actually run on this machine right now (toolchain check). */
    isAvailable(): Promise<{ available: boolean; reason?: string }>;
    /** Break a domain-level task into concrete micro-agent tasks and run them. */
    plan(task: AgentTask, ctx: ProjectContext): Promise<AgentTask[]>;
    run(task: AgentTask, ctx: ProjectContext): Promise<AgentResult[]>;
}

export interface OrchestrationPlanStep {
    miniOrchestratorId: string;
    task: AgentTask;
}

export interface OrchestrationPlan {
    projectId: string;
    steps: OrchestrationPlanStep[];
    rationale: string;
}
