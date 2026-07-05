import { BaseCommandAgent } from "../../core/BaseCommandAgent";

export class TestRunnerAgent extends BaseCommandAgent {
    readonly id = "test-runner";
    readonly label = "Test Runner Agent";
    readonly description = "Decides on and proposes the command to run the project's test suite.";
    readonly agentPath = "testing.test-runner";

    protected systemPrompt(): string {
        return (
            "You decide on the single shell command to run this project's test suite (e.g. `npm test`, " +
            "`npm run test`, `vitest run`). Prefer the project's existing package.json scripts if described in " +
            "context. Output only the command."
        );
    }
}
