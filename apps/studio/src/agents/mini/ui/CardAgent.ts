import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class CardAgent extends BaseFileAgent {
    readonly id = "card";
    readonly label = "Card Agent";
    readonly description = "Writes a single card/panel component (content container with consistent surface styling).";
    readonly agentPath = "ui.card";

    protected systemPrompt(): string {
        return (
            "You are a senior frontend engineer. Write a single, complete React + TypeScript card/panel " +
            "component: a reusable content container with consistent padding, border, and surface styling, " +
            "accepting children and optional header/footer slots. Output only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.componentName as string | undefined) ?? "Card";
        return `src/components/ui/${name}.tsx`;
    }
}
