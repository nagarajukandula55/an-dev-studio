import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class GradleConfigAgent extends BaseFileAgent {
    readonly id = "gradle-config";
    readonly label = "Gradle Config Agent";
    readonly description = "Writes a single Gradle build file (project-level or module-level build.gradle.kts, settings.gradle.kts).";
    readonly agentPath = "platform-android.gradle-config";

    protected systemPrompt(): string {
        return (
            "You are a senior Android platform engineer. Write a single, complete Gradle Kotlin DSL build " +
            "file with sensible defaults (compileSdk/minSdk/targetSdk versions, dependencies block). Output " +
            "only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        return (task.input.fileName as string | undefined) ?? "app/build.gradle.kts";
    }
}
