import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class TableAgent extends BaseFileAgent {
    readonly id = "table";
    readonly label = "Table Agent";
    readonly description = "Writes a single data table component (sortable columns, row rendering, pagination hooks).";
    readonly agentPath = "ui.table";

    protected systemPrompt(): string {
        return (
            "You are a senior frontend engineer specializing in data-dense UI. Write a single, complete React " +
            "+ TypeScript table component that accepts typed row data and column definitions as props, supports " +
            "sortable columns, and leaves room for pagination controls to be composed around it. Output only " +
            "the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.componentName as string | undefined) ?? "DataTable";
        return `src/components/ui/${name}.tsx`;
    }
}
