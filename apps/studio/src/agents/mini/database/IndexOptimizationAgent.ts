import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class IndexOptimizationAgent extends BaseFileAgent {
    readonly id = "index-optimization";
    readonly label = "Index Optimization Agent";
    readonly description = "Writes a single migration adding indexes for known query patterns.";
    readonly agentPath = "database.index-optimization";

    protected systemPrompt(): string {
        return (
            "You are a senior database engineer focused on query performance. Write a single, additive " +
            "migration that adds indexes matching the query patterns described in the task (e.g. lookups by " +
            "foreign key, filters on a status column, composite indexes for common WHERE + ORDER BY " +
            "combinations). Output only the migration file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.migrationName as string | undefined) ?? "add_indexes";
        const timestamp = (task.input.timestampPrefix as string | undefined) ?? "0002";
        return `db/migrations/${timestamp}_${name}.sql`;
    }
}
