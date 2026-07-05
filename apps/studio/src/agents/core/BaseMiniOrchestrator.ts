// ============================================================================
// AN Dev Studio — Base Mini-Orchestrator
//
// Shared plan()/run() logic so each concrete mini-orchestrator (UI, Backend,
// Database, Testing, DevOps, per-platform, Marketing, Automation) only has
// to declare its id/label/description/microAgents and an availability check
// — not reimplement the planning loop each time.
// ============================================================================

import type { AgentResult, AgentTask, MicroAgent, MiniOrchestrator, ProjectContext } from "./types";
import { completeJson } from "./llm";

interface MicroPlanResponse {
    tasks: { microAgentId: string; description: string; input: Record<string, unknown> }[];
}

interface ResolvedMicroTask {
    agentId: string;
    task: AgentTask;
}

export abstract class BaseMiniOrchestrator implements MiniOrchestrator {
    abstract readonly id: string;
    abstract readonly label: string;
    abstract readonly description: string;
    abstract readonly microAgents: MicroAgent[];

    async isAvailable(): Promise<{ available: boolean; reason?: string }> {
        return { available: true };
    }

    async plan(task: AgentTask, ctx: ProjectContext): Promise<AgentTask[]> {
        const resolved = await this.planInternal(task, ctx);
        return resolved.map((r) => r.task);
    }

    async run(task: AgentTask, ctx: ProjectContext): Promise<AgentResult[]> {
        const availability = await this.isAvailable();
        if (!availability.available) {
            return [{
                taskId: task.id,
                approvalRequestIds: [],
                summary: `${this.label} unavailable: ${availability.reason ?? "unknown"}`,
                success: false,
                error: "unavailable",
            }];
        }

        const microTasks = await this.planInternal(task, ctx);
        const results: AgentResult[] = [];

        for (const { agentId, task: microTask } of microTasks) {
            const agent = this.microAgents.find((a) => a.id === agentId);
            if (!agent) {
                results.push({
                    taskId: microTask.id,
                    approvalRequestIds: [],
                    summary: `No micro-agent "${agentId}" in ${this.label}.`,
                    success: false,
                    error: "unknown_micro_agent",
                });
                continue;
            }
            try {
                results.push(await agent.run(microTask, ctx));
            } catch (err) {
                results.push({
                    taskId: microTask.id,
                    approvalRequestIds: [],
                    summary: `${agent.label} failed.`,
                    success: false,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        return results;
    }

    /** Single source of truth for planning: asks the LLM to route sub-tasks to this domain's micro-agents by id. */
    private async planInternal(task: AgentTask, ctx: ProjectContext): Promise<ResolvedMicroTask[]> {
        const catalog = this.microAgents
            .map((a) => `- id: "${a.id}" — ${a.label}: ${a.description}`)
            .join("\n");

        const response = await completeJson<MicroPlanResponse>(
            `You are the "${this.label}" mini-orchestrator for a software build system.\n` +
            `Domain: ${this.description}\n\n` +
            `A parent task was assigned to you:\n"${task.description}"\n` +
            `Task input: ${JSON.stringify(task.input)}\n` +
            `Overall project goal: "${ctx.prompt}" (platform: ${ctx.platform})\n\n` +
            `Available micro-agents in your domain (route sub-tasks to these by id, exactly as spelled):\n${catalog}\n\n` +
            `Break your assigned task into concrete sub-tasks, each routed to exactly one micro-agent id, each ` +
            `producing one file or one focused change. Keep it to what's actually needed for a working result — ` +
            `do not invent unrelated work.\n\n` +
            `Respond as JSON: { "tasks": [{ "microAgentId": string, "description": string, "input": object }] }`,
        );

        return response.tasks.map((t, i) => ({
            agentId: t.microAgentId,
            task: { id: `${task.id}-${this.id}-${i}`, description: t.description, input: t.input ?? {} },
        }));
    }
}
