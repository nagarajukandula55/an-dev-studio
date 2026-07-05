// ============================================================================
// AN Dev Studio — Base Command-Running Micro-Agent
//
// Covers the common shape: "decide on one shell command to run (install
// deps, run the test suite, build, etc.), propose it for approval." Runs
// through the same ApprovalQueue as file writes — nothing executes without
// a human clicking Approve.
// ============================================================================

import type { AgentResult, AgentTask, MicroAgent, ProjectContext } from "./types";
import { complete } from "./llm";
import { approvalQueue } from "./ApprovalQueue";

export abstract class BaseCommandAgent implements MicroAgent {
    abstract readonly id: string;
    abstract readonly label: string;
    abstract readonly description: string;
    abstract readonly agentPath: string;

    protected abstract systemPrompt(): string;

    /** Working directory for the command, relative to the project folder. Defaults to the project root. */
    protected resolveCwd(_task: AgentTask): string {
        return ".";
    }

    async run(task: AgentTask, ctx: ProjectContext): Promise<AgentResult> {
        const cwd = this.resolveCwd(task);

        const rawCommand = await complete(
            `Project goal: "${ctx.prompt}" (platform: ${ctx.platform})\n` +
            `Your specific task: ${task.description}\n` +
            `Task details: ${JSON.stringify(task.input)}\n\n` +
            `Output ONLY the single shell command to run — no explanation, no markdown fences, no comments.`,
            { systemPrompt: this.systemPrompt() },
        );

        const command = rawCommand.trim().replace(/^```[a-zA-Z0-9]*\n?/, "").replace(/\n?```$/, "").trim();

        const request = approvalQueue.enqueue(
            ctx.projectId,
            this.agentPath,
            { kind: "shell_command", command, cwd, reason: task.description },
            ctx,
        );

        return {
            taskId: task.id,
            approvalRequestIds: [request.id],
            summary: `Proposed command: ${command} — awaiting approval.`,
            success: true,
        };
    }
}
