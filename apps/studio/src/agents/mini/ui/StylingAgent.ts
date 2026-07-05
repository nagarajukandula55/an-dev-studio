import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class StylingAgent extends BaseFileAgent {
    readonly id = "styling";
    readonly label = "Styling Agent";
    readonly description = "Writes shared stylesheet/theme files (global CSS, design tokens).";
    readonly agentPath = "ui.styling";

    protected systemPrompt(): string {
        return (
            "You are a senior frontend engineer focused on styling and design systems. Write a single, complete " +
            "CSS (or CSS-in-JS token) file matching the project's needs. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.fileName as string | undefined) ?? "theme.css";
        return `src/styles/${name}`;
    }
}
