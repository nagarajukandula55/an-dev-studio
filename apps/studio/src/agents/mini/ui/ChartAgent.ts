import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class ChartAgent extends BaseFileAgent {
    readonly id = "chart";
    readonly label = "Chart Agent";
    readonly description = "Writes a single data visualization component (line/bar/pie chart wrapper).";
    readonly agentPath = "ui.chart";

    protected systemPrompt(): string {
        return (
            "You are a senior frontend engineer specializing in data visualization. Write a single, complete " +
            "React + TypeScript chart component that accepts typed series data as props and renders it with " +
            "plain SVG (no external charting library dependency unless the task explicitly names one). Output " +
            "only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.componentName as string | undefined) ?? "Chart";
        return `src/components/charts/${name}.tsx`;
    }
}
