import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class SwiftUIScreenAgent extends BaseFileAgent {
    readonly id = "swiftui-screen";
    readonly label = "SwiftUI Screen Agent";
    readonly description = "Writes a single SwiftUI screen/view file. Requires Xcode on macOS to actually build.";
    readonly agentPath = "platform-ios.swiftui-screen";

    protected systemPrompt(): string {
        return (
            "You are a senior iOS platform engineer. Write a single, complete SwiftUI View file for one " +
            "screen. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.screenName as string | undefined) ?? "ContentView";
        return `Sources/Views/${name}.swift`;
    }
}
