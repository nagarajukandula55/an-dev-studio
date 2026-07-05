// ============================================================================
// iOS Platform Mini-Orchestrator — SCAFFOLD ONLY, NOT YET FUNCTIONAL
//
// Real iOS builds require Xcode, which only runs on macOS — this cannot
// function on a Windows laptop at all, full stop, regardless of what gets
// installed. This orchestrator exists so the org-chart shape is complete;
// isAvailable() always reports unavailable on non-macOS hosts rather than
// pretending otherwise.
// ============================================================================

import { BaseFileAgent } from "../../core/BaseFileAgent";
import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { AgentTask, MicroAgent } from "../../core/types";

class IosScaffoldAgent extends BaseFileAgent {
    readonly id = "ios-scaffold";
    readonly label = "iOS Scaffold Agent";
    readonly description = "Writes iOS project scaffolding (Swift source, Xcode project files). Requires Xcode on macOS to actually build.";
    readonly agentPath = "platform-ios.ios-scaffold";

    protected systemPrompt(): string {
        return (
            "You are a senior iOS platform engineer. Write a single, complete Swift/SwiftUI source file or " +
            "Xcode project config fragment. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        return (task.input.fileName as string | undefined) ?? "Sources/App.swift";
    }
}

class IosPlatformMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "platform-ios";
    readonly label = "iOS Platform";
    readonly description = "Native iOS app scaffolding. Building requires Xcode on macOS — cannot run on Windows at all.";
    readonly microAgents: MicroAgent[] = [new IosScaffoldAgent()];

    async isAvailable(): Promise<{ available: boolean; reason?: string }> {
        if (process.platform !== "darwin") {
            return {
                available: false,
                reason: "iOS builds require Xcode, which only runs on macOS. This machine is not macOS — this orchestrator can propose source files for review, but nothing can actually be built or run here.",
            };
        }
        return { available: true };
    }
}

export const iosPlatformMiniOrchestrator = new IosPlatformMiniOrchestrator();
