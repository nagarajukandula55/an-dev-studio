import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class IntegrationTestAgent extends BaseFileAgent {
    readonly id = "integration-test";
    readonly label = "Integration Test Agent";
    readonly description = "Writes a single integration test exercising an API route or multi-module flow end-to-end.";
    readonly agentPath = "testing.integration-test";

    protected systemPrompt(): string {
        return (
            "You are a senior test engineer writing integration tests. Write a single, complete test file that " +
            "exercises a real API route or a multi-module flow (not mocked in isolation), using the project's " +
            "existing test framework conventions. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const target = (task.input.targetFlow as string | undefined) ?? "flow";
        return `src/__tests__/integration/${target}.test.ts`;
    }
}
