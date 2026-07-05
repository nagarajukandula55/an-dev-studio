import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class LayoutAgent extends BaseFileAgent {
    readonly id = "layout";
    readonly label = "Layout Agent";
    readonly description = "Writes page-level layout/shell files (navigation, page structure).";
    readonly agentPath = "ui.layout";

    protected systemPrompt(): string {
        return (
            "You are a senior frontend engineer focused on page layout and composition. Write a single, " +
            "complete layout or page file that composes existing/expected components. Use TypeScript and React. " +
            "Output only the file's source code, nothing else."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.pageName as string | undefined) ?? "page";
        return `src/app/${name}/page.tsx`;
    }
}
