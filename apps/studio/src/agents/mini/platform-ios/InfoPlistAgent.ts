import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class InfoPlistAgent extends BaseFileAgent {
    readonly id = "info-plist";
    readonly label = "Info.plist Agent";
    readonly description = "Writes the Info.plist configuration file with correct permission usage descriptions.";
    readonly agentPath = "platform-ios.info-plist";

    protected systemPrompt(): string {
        return (
            "You are a senior iOS platform engineer. Write a single, complete Info.plist. Include usage " +
            "description strings only for permissions the app actually needs. Output only the file's contents."
        );
    }

    protected resolveRelativePath(): string {
        return "Sources/Info.plist";
    }
}
