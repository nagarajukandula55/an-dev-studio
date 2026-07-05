// ============================================================================
// Android Platform Mini-Orchestrator — SCAFFOLD ONLY, NOT YET FUNCTIONAL
//
// Real Android builds need the Android SDK/NDK, a JDK, and (for anything
// beyond a bare Gradle build) Android Studio — none of which the
// setup-desktop.ps1 script installs, and none of which are verified present
// here. This orchestrator exists so the org-chart shape is complete and so
// wiring in real Android micro-agents later is a matter of filling in
// AndroidScaffoldAgent's system prompt/output convention, not restructuring
// the framework. isAvailable() reports this honestly rather than pretending
// it works.
// ============================================================================

import { spawn } from "child_process";
import { BaseFileAgent } from "../../core/BaseFileAgent";
import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { AgentTask, MicroAgent } from "../../core/types";

class AndroidScaffoldAgent extends BaseFileAgent {
    readonly id = "android-scaffold";
    readonly label = "Android Scaffold Agent";
    readonly description = "Writes Android project scaffolding (Gradle config, manifest). Requires the Android SDK to actually build.";
    readonly agentPath = "platform-android.android-scaffold";

    protected systemPrompt(): string {
        return (
            "You are a senior Android platform engineer. Write a single, complete Android project file " +
            "(build.gradle.kts, AndroidManifest.xml, or a Kotlin source file). Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        return (task.input.fileName as string | undefined) ?? "app/build.gradle.kts";
    }
}

function commandExists(cmd: string): Promise<boolean> {
    return new Promise((resolve) => {
        const child = spawn(process.platform === "win32" ? "where" : "which", [cmd], { windowsHide: true });
        child.on("error", () => resolve(false));
        child.on("exit", (code) => resolve(code === 0));
    });
}

class AndroidPlatformMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "platform-android";
    readonly label = "Android Platform";
    readonly description = "Native Android app scaffolding. Building actually requires the Android SDK/NDK (Android Studio) installed separately — not part of the automated setup script yet.";
    readonly microAgents: MicroAgent[] = [new AndroidScaffoldAgent()];

    async isAvailable(): Promise<{ available: boolean; reason?: string }> {
        const hasAdb = await commandExists("adb");
        if (!hasAdb || !process.env.ANDROID_HOME) {
            return {
                available: false,
                reason:
                    "Android SDK not detected (no ANDROID_HOME / adb on PATH). Install Android Studio and its " +
                    "SDK, then set ANDROID_HOME, before this orchestrator can actually build anything. It can " +
                    "still propose source files for review even without a working build.",
            };
        }
        return { available: true };
    }
}

export const androidPlatformMiniOrchestrator = new AndroidPlatformMiniOrchestrator();
