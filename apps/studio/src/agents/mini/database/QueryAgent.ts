import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class QueryAgent extends BaseFileAgent {
    readonly id = "query";
    readonly label = "Query/Repository Agent";
    readonly description = "Writes a single data-access module (queries/repository functions for one resource).";
    readonly agentPath = "database.query";

    protected systemPrompt(): string {
        return (
            "You are a senior database engineer writing a data-access layer. Write a single, complete " +
            "repository/query module for one resource: parameterized queries only (never string-concatenate " +
            "user input into SQL), clear function names, and typed return values. Output only the file's " +
            "source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.resourceName as string | undefined) ?? "resource";
        return `src/lib/db/${name}.ts`;
    }
}
