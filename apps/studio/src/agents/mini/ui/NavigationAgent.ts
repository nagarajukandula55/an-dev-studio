import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class NavigationAgent extends BaseFileAgent {
    readonly id = "navigation";
    readonly label = "Navigation Agent";
    readonly description = "Writes a single navigation component (sidebar, navbar, tabs, breadcrumbs).";
    readonly agentPath = "ui.navigation";

    protected systemPrompt(): string {
        return (
            "You are a senior frontend engineer specializing in navigation UX. Write a single, complete React " +
            "+ TypeScript navigation component (sidebar, top nav, tab bar, or breadcrumb trail, as specified " +
            "by the task) with active-state highlighting based on the current route. Output only the file's " +
            "source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.componentName as string | undefined) ?? "Navigation";
        return `src/components/layout/${name}.tsx`;
    }
}
