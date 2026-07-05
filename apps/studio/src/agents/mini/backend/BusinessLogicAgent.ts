import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class BusinessLogicAgent extends BaseFileAgent {
    readonly id = "business-logic";
    readonly label = "Business Logic Agent";
    readonly description = "Writes a single service/module implementing core application logic.";
    readonly agentPath = "backend.business-logic";

    protected systemPrompt(): string {
        return (
            "You are a senior backend engineer writing a focused, single-responsibility service module. " +
            "Prefer small, testable pure functions where possible. Output only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.moduleName as string | undefined) ?? "service";
        return `src/lib/${name}.ts`;
    }
}
