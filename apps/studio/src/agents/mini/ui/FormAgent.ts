import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class FormAgent extends BaseFileAgent {
    readonly id = "form";
    readonly label = "Form Agent";
    readonly description = "Writes a single form component with fields, validation, and submit handling.";
    readonly agentPath = "ui.form";

    protected systemPrompt(): string {
        return (
            "You are a senior frontend engineer specializing in forms. Write a single, complete React + " +
            "TypeScript form component with controlled inputs, client-side validation, and a submit handler " +
            "that calls the appropriate API route. Output only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.componentName as string | undefined) ?? "Form";
        return `src/components/forms/${name}.tsx`;
    }
}
