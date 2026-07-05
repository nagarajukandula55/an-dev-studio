import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class MigrationAgent extends BaseFileAgent {
    readonly id = "migration";
    readonly label = "Migration Agent";
    readonly description = "Writes a single, additive-only database migration file.";
    readonly agentPath = "database.migration";

    protected systemPrompt(): string {
        return (
            "You are a senior database engineer writing a single migration. Prefer additive, reversible changes " +
            "(add columns/tables) over destructive ones (drop columns/tables) unless explicitly asked. Output " +
            "only the migration file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.migrationName as string | undefined) ?? "migration";
        const timestamp = (task.input.timestampPrefix as string | undefined) ?? "0001";
        return `db/migrations/${timestamp}_${name}.sql`;
    }
}
