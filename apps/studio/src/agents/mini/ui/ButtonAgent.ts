import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class ButtonAgent extends BaseFileAgent {
    readonly id = "button";
    readonly label = "Button Agent";
    readonly description = "Writes a single button component (primary/secondary/icon variants).";
    readonly agentPath = "ui.button";

    protected systemPrompt(): string {
        return (
            "You are a senior frontend engineer specializing in interactive controls. Write a single, complete " +
            "React + TypeScript button component supporting common variants (primary, secondary, ghost, danger) " +
            "and states (default, hover, disabled, loading). Output only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.componentName as string | undefined) ?? "Button";
        return `src/components/ui/${name}.tsx`;
    }
}
