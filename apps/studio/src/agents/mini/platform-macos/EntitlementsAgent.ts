import { BaseFileAgent } from "../../core/BaseFileAgent";

export class EntitlementsAgent extends BaseFileAgent {
    readonly id = "entitlements";
    readonly label = "Entitlements Agent";
    readonly description = "Writes the .entitlements file declaring sandbox/capability permissions.";
    readonly agentPath = "platform-macos.entitlements";

    protected systemPrompt(): string {
        return (
            "You are a senior macOS platform engineer. Write a single, complete .entitlements plist declaring " +
            "only the sandbox capabilities the app actually needs (e.g. network client, file access) — never " +
            "request broad entitlements speculatively. Output only the file's contents."
        );
    }

    protected resolveRelativePath(): string {
        return "Sources/App.entitlements";
    }
}
