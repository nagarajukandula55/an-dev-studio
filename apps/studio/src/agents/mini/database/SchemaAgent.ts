import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class SchemaAgent extends BaseFileAgent {
    readonly id = "schema";
    readonly label = "Schema Agent";
    readonly description = "Writes a single database schema/model definition file.";
    readonly agentPath = "database.schema";

    protected systemPrompt(): string {
        return (
            "You are a senior database engineer. Write a single, complete schema/model definition file " +
            "(e.g. Prisma schema fragment, SQL DDL, or ORM model — match whatever convention fits the stated " +
            "project). Include sensible types, constraints, and indexes. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.modelName as string | undefined) ?? "schema";
        return `db/${name}.sql`;
    }
}
