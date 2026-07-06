// ============================================================================
// Android Platform Mini-Orchestrator
//
// Unlike iOS/macOS, Android CAN build on Windows once the Android SDK/adb
// are installed — this orchestrator has real, per-file-type micro-agents
// (Gradle config, manifest, activities/screens, layouts), matching the same
// granularity as Web/Windows. The SDK itself is intentionally NOT installed
// by default (setup-desktop.ps1 doesn't fetch it) — isAvailable() detects
// whether it's present and reports exactly what's missing; the SDK gets
// installed on demand only when an Android build is actually attempted,
// rather than bloating every fresh install with tooling most projects won't
// use immediately.
// ============================================================================

import { spawn } from "child_process";
import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { GradleConfigAgent } from "./GradleConfigAgent";
import { ManifestAgent } from "./ManifestAgent";
import { ActivityAgent } from "./ActivityAgent";
import { LayoutXmlAgent } from "./LayoutXmlAgent";

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
    readonly description = "Native Android app scaffolding — Gradle config, manifest, activities/screens, and layouts.";
    readonly microAgents: MicroAgent[] = [
        new GradleConfigAgent(),
        new ManifestAgent(),
        new ActivityAgent(),
        new LayoutXmlAgent(),
    ];

    async isAvailable(): Promise<{ available: boolean; reason?: string }> {
        const hasAdb = await commandExists("adb");
        if (!hasAdb || !process.env.ANDROID_HOME) {
            return {
                available: false,
                reason:
                    "Android SDK not detected (no ANDROID_HOME / adb on PATH). Install the Android SDK " +
                    "command-line tools (or Android Studio) and set ANDROID_HOME, then this orchestrator can " +
                    "actually build/run — it can still propose Gradle/manifest/source files for review without it.",
            };
        }
        return { available: true };
    }
}

export const androidPlatformMiniOrchestrator = new AndroidPlatformMiniOrchestrator();
