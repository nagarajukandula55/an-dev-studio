import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class SeedAgent extends BaseFileAgent {
    readonly id = "seed";
    readonly label = "Seed Data Agent";
    readonly description = "Writes a single seed/fixture data script for local development.";
    readonly agentPath = "database.seed";

    protected systemPrompt(): string {
        return (
            "You are a senior database engineer writing seed/fixture data for local development. Write a " +
            "single, complete seed script that inserts a small, realistic set of sample rows — enough to " +
            "exercise the app's features without being excessive. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.seedName as string | undefined) ?? "seed";
        return `db/seeds/${name}.sql`;
    }
}
