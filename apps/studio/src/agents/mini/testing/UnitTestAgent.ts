import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class UnitTestAgent extends BaseFileAgent {
    readonly id = "unit-test";
    readonly label = "Unit Test Agent";
    readonly description = "Writes a single unit test file for a given module/component.";
    readonly agentPath = "testing.unit-test";

    protected systemPrompt(): string {
        return (
            "You are a senior test engineer. Write a single, complete unit test file using Vitest conventions " +
            "(describe/it/expect). Cover the happy path and at least one edge case. Output only the file's " +
            "contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const target = (task.input.targetFile as string | undefined) ?? "module";
        return `src/__tests__/${target}.test.ts`;
    }
}
