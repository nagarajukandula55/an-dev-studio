import { BaseCommandAgent } from "../../core/BaseCommandAgent";

export class CoverageAgent extends BaseCommandAgent {
    readonly id = "coverage";
    readonly label = "Coverage Agent";
    readonly description = "Proposes the command to run the test suite with coverage reporting enabled.";
    readonly agentPath = "testing.coverage";

    protected systemPrompt(): string {
        return (
            "You decide on the single shell command to run this project's test suite WITH coverage reporting " +
            "enabled (e.g. `npm run test -- --coverage`, `vitest run --coverage`). Prefer the project's existing " +
            "package.json scripts if described in context. Output only the command."
        );
    }
}
