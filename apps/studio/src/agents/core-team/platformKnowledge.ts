// ============================================================================
// AN Dev Studio — Platform Knowledge
//
// Folds each platform's specifics (Web/Windows/Android/iOS/macOS) into a
// prompt section keyed by ctx.platform, consumed by ScaffolderAgent (initial
// skeleton) and DeployerAgent (run/deploy config). Replaces the old
// mini/platform-* orchestrators — same domain knowledge, no separate agent
// hierarchy needed to hold it.
// ============================================================================

import type { Platform } from "../core/types";

export interface PlatformAvailability {
    available: boolean;
    reason?: string;
}

const SCAFFOLD_NOTES: Record<Platform, string> = {
    web: "Next.js + TypeScript web project: package.json, tsconfig.json, next.config.ts, app router structure.",
    windows:
        "Windows desktop app: a Next.js/TypeScript web frontend wrapped by Tauri v2 (src-tauri/tauri.conf.json, " +
        "Rust entry point) — the same pattern this repo itself uses for its own desktop build.",
    android:
        "Native Android app: Gradle Kotlin DSL build files (project- and module-level), AndroidManifest.xml " +
        "with only the permissions actually needed, Kotlin/Jetpack Compose screens under " +
        "app/src/main/java/com/andevstudio/app/.",
    ios:
        "Native iOS app: SwiftUI views under Sources/Views/, Info.plist with usage-description strings only " +
        "for permissions actually needed. Cannot be built or run outside Xcode on macOS.",
    macos:
        "Native macOS app: SwiftUI/AppKit windows under Sources/Views/, a .entitlements file declaring only " +
        "the sandbox capabilities actually needed. Cannot be built or run outside Xcode on macOS.",
};

const DEPLOY_NOTES: Record<Platform, string> = {
    web: "Generate a Dockerfile (multi-stage, minimal base image) and/or vercel.json for hosting this Next.js app.",
    windows: "Document the Tauri build command (tauri build) and its output path; no containerization needed for a desktop app.",
    android: "Document the Gradle release-build command (assembleRelease/bundleRelease) and signing prerequisites.",
    ios: "Document the Xcode archive/export steps; cannot be automated outside Xcode on macOS.",
    macos: "Document the Xcode archive/notarization steps; cannot be automated outside Xcode on macOS.",
};

export function scaffoldNotesFor(platform: Platform): string {
    return SCAFFOLD_NOTES[platform];
}

export function deployNotesFor(platform: Platform): string {
    return DEPLOY_NOTES[platform];
}

/**
 * Only Web and Windows can actually build/run on this machine's toolchain
 * today (Node always present; Windows needs Rust/Cargo, set up by
 * setup-desktop.ps1). Android needs the SDK/adb (not installed by default —
 * detected on demand). iOS/macOS require Xcode on macOS and can never build
 * here. Files can still be proposed for every platform; this only gates
 * whether a "verify build" step is meaningful.
 */
export async function checkPlatformAvailability(platform: Platform): Promise<PlatformAvailability> {
    if (platform === "web") return { available: true };

    if (platform === "windows") {
        const hasCargo = await commandExists("cargo");
        return hasCargo
            ? { available: true }
            : { available: false, reason: "Windows desktop builds need Rust/Cargo — run setup-desktop.ps1 first." };
    }

    if (platform === "android") {
        const hasAdb = await commandExists("adb");
        return hasAdb
            ? { available: true }
            : {
                  available: false,
                  reason: "Android builds need the Android SDK/adb, not installed by default. Files can still be proposed for review.",
              };
    }

    // ios / macos
    if (process.platform !== "darwin") {
        return {
            available: false,
            reason: `${platform === "ios" ? "iOS" : "macOS"} builds require Xcode, which only runs on macOS. Files can still be proposed for review, but nothing can be built or run here.`,
        };
    }
    return { available: true };
}

async function commandExists(cmd: string): Promise<boolean> {
    const { spawn } = await import("child_process");
    return new Promise((resolve) => {
        const child = spawn(process.platform === "win32" ? "where" : "which", [cmd], { windowsHide: true });
        child.on("error", () => resolve(false));
        child.on("exit", (code) => resolve(code === 0));
    });
}
