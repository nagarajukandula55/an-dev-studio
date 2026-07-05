import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { CopyAgent } from "./CopyAgent";

class MarketingMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "marketing";
    readonly label = "Marketing";
    readonly description = "Marketing copy and content generation. (Image/asset generation is a future addition.)";
    readonly microAgents: MicroAgent[] = [new CopyAgent()];
}

export const marketingMiniOrchestrator = new MarketingMiniOrchestrator();
