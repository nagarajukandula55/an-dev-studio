import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class ModalAgent extends BaseFileAgent {
    readonly id = "modal";
    readonly label = "Modal Agent";
    readonly description = "Writes a single modal/dialog component (open/close state, backdrop, focus trap).";
    readonly agentPath = "ui.modal";

    protected systemPrompt(): string {
        return (
            "You are a senior frontend engineer specializing in overlays. Write a single, complete React + " +
            "TypeScript modal/dialog component with accessible open/close behavior (Escape to close, backdrop " +
            "click to close, basic focus handling). Output only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.componentName as string | undefined) ?? "Modal";
        return `src/components/ui/${name}.tsx`;
    }
}
