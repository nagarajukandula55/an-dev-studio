import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class ActivityAgent extends BaseFileAgent {
    readonly id = "activity";
    readonly label = "Activity/Screen Agent";
    readonly description = "Writes a single Kotlin Activity or Jetpack Compose screen file.";
    readonly agentPath = "platform-android.activity";

    protected systemPrompt(): string {
        return (
            "You are a senior Android platform engineer. Write a single, complete Kotlin file for one " +
            "Activity or Jetpack Compose screen, following current Android best practices (Compose over " +
            "XML layouts unless the task specifies XML views). Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.screenName as string | undefined) ?? "MainActivity";
        return `app/src/main/java/com/andevstudio/app/${name}.kt`;
    }
}
