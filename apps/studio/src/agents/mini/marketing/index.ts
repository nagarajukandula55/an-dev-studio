import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { CopyAgent } from "./CopyAgent";
import { SeoAgent } from "./SeoAgent";
import { EmailCopyAgent } from "./EmailCopyAgent";

class MarketingMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "marketing";
    readonly label = "Marketing";
    readonly description = "Marketing copy, SEO metadata, and email content. (Image/asset generation is a future addition.)";
    readonly microAgents: MicroAgent[] = [new CopyAgent(), new SeoAgent(), new EmailCopyAgent()];
}

export const marketingMiniOrchestrator = new MarketingMiniOrchestrator();
