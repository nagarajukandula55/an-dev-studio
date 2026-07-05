import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class ComponentBuilderAgent extends BaseFileAgent {
    readonly id = "component-builder";
    readonly label = "Component Builder";
    readonly description = "Writes a single UI component file (one component per run).";
    readonly agentPath = "ui.component-builder";

    protected systemPrompt(): string {
        return (
            "You are a senior frontend engineer. Write a single, complete, production-quality UI component. " +
            "Use TypeScript and React function components. Prefer plain CSS-in-JS style objects or Tailwind " +
            "classes over inventing new styling systems, unless the project context says otherwise. " +
            "Do not include explanations — output only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.componentName as string | undefined) ?? "GeneratedComponent";
        return `src/components/${name}.tsx`;
    }
}
