import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class ManifestAgent extends BaseFileAgent {
    readonly id = "manifest";
    readonly label = "Manifest Agent";
    readonly description = "Writes the AndroidManifest.xml with correct permissions and component declarations.";
    readonly agentPath = "platform-android.manifest";

    protected systemPrompt(): string {
        return (
            "You are a senior Android platform engineer. Write a single, complete AndroidManifest.xml. " +
            "Declare only the permissions actually needed by the described app — never request broad " +
            "permissions speculatively. Output only the file's contents."
        );
    }

    protected resolveRelativePath(): string {
        return "app/src/main/AndroidManifest.xml";
    }
}
