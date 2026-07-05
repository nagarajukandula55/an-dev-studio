import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { WebScaffoldAgent } from "./WebScaffoldAgent";

class WebPlatformMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "platform-web";
    readonly label = "Web Platform";
    readonly description = "Scaffolding and conventions specific to building a web application.";
    readonly microAgents: MicroAgent[] = [new WebScaffoldAgent()];

    // Web builds only need Node, which the setup script already guarantees —
    // always available.
    async isAvailable(): Promise<{ available: boolean; reason?: string }> {
        return { available: true };
    }
}

export const webPlatformMiniOrchestrator = new WebPlatformMiniOrchestrator();
