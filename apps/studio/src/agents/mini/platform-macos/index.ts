// ============================================================================
// macOS Platform Mini-Orchestrator — SCAFFOLD ONLY, NOT YET FUNCTIONAL
//
// Same story as iOS: native macOS app builds need Xcode/macOS, which cannot
// run on a Windows laptop. Kept as a real interface implementation so the
// pattern is uniform across all five platforms, honestly reporting
// unavailable rather than pretending.
// ============================================================================

import { BaseFileAgent } from "../../core/BaseFileAgent";
import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { AgentTask, MicroAgent } from "../../core/types";

class MacosScaffoldAgent extends BaseFileAgent {
    readonly id = "macos-scaffold";
    readonly label = "macOS Scaffold Agent";
    readonly description = "Writes macOS project scaffolding (Swift/AppKit source, Xcode project files). Requires Xcode on macOS to actually build.";
    readonly agentPath = "platform-macos.macos-scaffold";

    protected systemPrompt(): string {
        return (
            "You are a senior macOS platform engineer. Write a single, complete Swift/AppKit source file or " +
            "Xcode project config fragment. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        return (task.input.fileName as string | undefined) ?? "Sources/App.swift";
    }
}

class MacosPlatformMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "platform-macos";
    readonly label = "macOS Platform";
    readonly description = "Native macOS app scaffolding. Building requires Xcode on macOS — cannot run on Windows at all.";
    readonly microAgents: MicroAgent[] = [new MacosScaffoldAgent()];

    async isAvailable(): Promise<{ available: boolean; reason?: string }> {
        if (process.platform !== "darwin") {
            return {
                available: false,
                reason: "macOS native builds require Xcode on macOS. This machine is not macOS — this orchestrator can propose source files for review, but nothing can actually be built or run here.",
            };
        }
        return { available: true };
    }
}

export const macosPlatformMiniOrchestrator = new MacosPlatformMiniOrchestrator();
