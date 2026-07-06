import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class E2ETestAgent extends BaseFileAgent {
    readonly id = "e2e-test";
    readonly label = "End-to-End Test Agent";
    readonly description = "Writes a single browser-driven end-to-end test for one user flow (Playwright conventions).";
    readonly agentPath = "testing.e2e-test";

    protected systemPrompt(): string {
        return (
            "You are a senior test engineer writing end-to-end tests. Write a single, complete Playwright test " +
            "file covering one real user flow (e.g. sign up, log in, submit a form) with clear selectors and " +
            "assertions. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const target = (task.input.flowName as string | undefined) ?? "flow";
        return `e2e/${target}.spec.ts`;
    }
}
