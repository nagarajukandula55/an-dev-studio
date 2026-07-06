import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class ValidationAgent extends BaseFileAgent {
    readonly id = "validation";
    readonly label = "Validation Agent";
    readonly description = "Writes a single input-validation schema/module for one resource or endpoint.";
    readonly agentPath = "backend.validation";

    protected systemPrompt(): string {
        return (
            "You are a senior backend engineer specializing in input validation. Write a single, complete " +
            "validation schema/module for one resource (using zod if the project already depends on it, " +
            "otherwise plain hand-written validation functions). Cover required fields, types, and sane " +
            "bounds. Output only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.resourceName as string | undefined) ?? "resource";
        return `src/lib/validation/${name}.ts`;
    }
}
