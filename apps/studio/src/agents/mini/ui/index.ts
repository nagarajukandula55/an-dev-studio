import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { ComponentBuilderAgent } from "./ComponentBuilderAgent";
import { LayoutAgent } from "./LayoutAgent";
import { StylingAgent } from "./StylingAgent";

class UiMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "ui";
    readonly label = "UI";
    readonly description = "Frontend components, pages/layouts, and styling.";
    readonly microAgents: MicroAgent[] = [
        new ComponentBuilderAgent(),
        new LayoutAgent(),
        new StylingAgent(),
    ];
}

export const uiMiniOrchestrator = new UiMiniOrchestrator();
