// ============================================================================
// macOS Platform Mini-Orchestrator — proposes files only, cannot build here
//
// Same story as iOS: native macOS app builds need Xcode/macOS, which cannot
// run on a Windows laptop. Testing is skipped entirely for this platform at
// the GlobalOrchestrator level, since nothing here can actually be run or
// tested on this machine either — files are prepared for a real Mac later.
// ============================================================================

import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { SwiftUIWindowAgent } from "./SwiftUIWindowAgent";
import { EntitlementsAgent } from "./EntitlementsAgent";

class MacosPlatformMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "platform-macos";
    readonly label = "macOS Platform";
    readonly description = "Native macOS app scaffolding (windows/views, entitlements). Building requires Xcode on macOS — cannot run on Windows at all.";
    readonly microAgents: MicroAgent[] = [new SwiftUIWindowAgent(), new EntitlementsAgent()];

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
