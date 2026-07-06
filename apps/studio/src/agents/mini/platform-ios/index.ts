// ============================================================================
// iOS Platform Mini-Orchestrator — proposes files only, cannot build here
//
// Real iOS builds require Xcode, which only runs on macOS — this cannot
// function on a Windows laptop at all, full stop, regardless of what gets
// installed. isAvailable() always reports unavailable on non-macOS hosts.
// Per explicit instruction, this orchestrator still has multiple focused
// micro-agents (not one catch-all) so files can be prepared now and handed
// off to a real Mac/Xcode environment later; Testing is skipped entirely
// for this platform at the GlobalOrchestrator level, since nothing here can
// actually be run/tested on this machine either.
// ============================================================================

import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { SwiftUIScreenAgent } from "./SwiftUIScreenAgent";
import { InfoPlistAgent } from "./InfoPlistAgent";

class IosPlatformMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "platform-ios";
    readonly label = "iOS Platform";
    readonly description = "Native iOS app scaffolding (SwiftUI screens, Info.plist). Building requires Xcode on macOS — cannot run on Windows at all.";
    readonly microAgents: MicroAgent[] = [new SwiftUIScreenAgent(), new InfoPlistAgent()];

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
