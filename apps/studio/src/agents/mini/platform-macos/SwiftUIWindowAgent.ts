import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class SwiftUIWindowAgent extends BaseFileAgent {
    readonly id = "swiftui-window";
    readonly label = "SwiftUI Window Agent";
    readonly description = "Writes a single SwiftUI/AppKit window or view file. Requires Xcode on macOS to actually build.";
    readonly agentPath = "platform-macos.swiftui-window";

    protected systemPrompt(): string {
        return (
            "You are a senior macOS platform engineer. Write a single, complete SwiftUI (or AppKit, if the " +
            "task specifies) window/view file. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.windowName as string | undefined) ?? "ContentView";
        return `Sources/Views/${name}.swift`;
    }
}
