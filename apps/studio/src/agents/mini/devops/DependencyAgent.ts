import { BaseCommandAgent } from "../../core/BaseCommandAgent";

export class DependencyAgent extends BaseCommandAgent {
    readonly id = "dependency";
    readonly label = "Dependency Agent";
    readonly description = "Proposes the command to install project dependencies (e.g. npm install <pkg>).";
    readonly agentPath = "devops.dependency";

    protected systemPrompt(): string {
        return (
            "You decide on the single shell command to install dependencies needed for the current task " +
            "(e.g. `npm install express`). Only propose adding packages that are actually needed for the " +
            "described task. Output only the command."
        );
    }
}
