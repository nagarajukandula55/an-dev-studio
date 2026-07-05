// ============================================================================
// AN Dev Studio — Base File-Writing Micro-Agent
//
// Covers the common shape: "generate the contents of one file, propose it
// for approval." Concrete micro-agents (Button component, API route,
// migration file, test file, etc.) just supply a system prompt and how to
// derive the target relative path from the task.
// ============================================================================

import fs from "fs";
import path from "path";
import type { AgentResult, AgentTask, MicroAgent, ProjectContext } from "./types";
import { complete } from "./llm";
import { approvalQueue } from "./ApprovalQueue";

export abstract class BaseFileAgent implements MicroAgent {
    abstract readonly id: string;
    abstract readonly label: string;
    abstract readonly description: string;
    abstract readonly agentPath: string; // e.g. "ui.component-builder", used in the approval audit trail

    /** System prompt steering the LLM toward this agent's specific kind of file. */
    protected abstract systemPrompt(): string;

    /** Where the generated file should live, relative to the project folder. Derived from the task's input. */
    protected abstract resolveRelativePath(task: AgentTask): string;

    async run(task: AgentTask, ctx: ProjectContext): Promise<AgentResult> {
        const relativePath = this.resolveRelativePath(task);

        const generated = await complete(
            `Project goal: "${ctx.prompt}" (platform: ${ctx.platform})\n` +
            `Your specific task: ${task.description}\n` +
            `Task details: ${JSON.stringify(task.input)}\n` +
            `Target file path: ${relativePath}\n\n` +
            `Output ONLY the complete file contents — no markdown code fences, no explanation before or after.`,
            { systemPrompt: this.systemPrompt() },
        );

        const cleaned = stripCodeFence(generated);
        const previousContent = readIfExists(path.join(ctx.targetFolder, relativePath));

        const request = approvalQueue.enqueue(
            ctx.projectId,
            this.agentPath,
            {
                kind: "file_write",
                relativePath,
                newContent: cleaned,
                previousContent,
                reason: task.description,
            },
            ctx,
        );

        return {
            taskId: task.id,
            approvalRequestIds: [request.id],
            summary: `Proposed ${relativePath} — awaiting approval.`,
            success: true,
        };
    }
}

function stripCodeFence(text: string): string {
    const trimmed = text.trim();
    const fenceMatch = trimmed.match(/^```[a-zA-Z0-9]*\s*([\s\S]*?)\s*```$/);
    return fenceMatch ? fenceMatch[1] : trimmed;
}

function readIfExists(absolutePath: string): string {
    try {
        return fs.readFileSync(absolutePath, "utf-8");
    } catch {
        return "";
    }
}
