import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class ScriptAgent extends BaseFileAgent {
    readonly id = "script";
    readonly label = "Script Agent";
    readonly description = "Writes a single automation script (e.g. a scheduled task, data pipeline step, or CLI tool).";
    readonly agentPath = "automation.script";

    protected systemPrompt(): string {
        return (
            "You are a senior automation engineer. Write a single, complete, well-commented script. Prefer " +
            "explicit error handling over silent failure. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.scriptName as string | undefined) ?? "script";
        return `scripts/${name}.ts`;
    }
}
