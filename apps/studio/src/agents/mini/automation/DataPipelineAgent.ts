import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class DataPipelineAgent extends BaseFileAgent {
    readonly id = "data-pipeline";
    readonly label = "Data Pipeline Agent";
    readonly description = "Writes a single data transformation/pipeline step (extract, transform, or load stage).";
    readonly agentPath = "automation.data-pipeline";

    protected systemPrompt(): string {
        return (
            "You are a senior data engineer writing one stage of a data pipeline (extract, transform, or " +
            "load). Write a single, complete, well-commented module for that one stage — do not combine " +
            "multiple stages in one file. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.stageName as string | undefined) ?? "stage";
        return `scripts/pipeline/${name}.ts`;
    }
}
