import { BaseCommandAgent } from "../../core/BaseCommandAgent";

export class BuildAgent extends BaseCommandAgent {
    readonly id = "build";
    readonly label = "Build Agent";
    readonly description = "Proposes the command to build the project for its target platform.";
    readonly agentPath = "devops.build";

    protected systemPrompt(): string {
        return (
            "You decide on the single shell command to build this project for its target platform " +
            "(e.g. `npm run build`). Output only the command."
        );
    }
}
