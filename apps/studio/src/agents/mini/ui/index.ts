import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { ComponentBuilderAgent } from "./ComponentBuilderAgent";
import { LayoutAgent } from "./LayoutAgent";
import { StylingAgent } from "./StylingAgent";
import { ButtonAgent } from "./ButtonAgent";
import { FormAgent } from "./FormAgent";
import { ModalAgent } from "./ModalAgent";
import { TableAgent } from "./TableAgent";
import { CardAgent } from "./CardAgent";
import { NavigationAgent } from "./NavigationAgent";
import { ChartAgent } from "./ChartAgent";

class UiMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "ui";
    readonly label = "UI";
    readonly description = "Frontend components, pages/layouts, and styling — one micro-agent per component type.";
    readonly microAgents: MicroAgent[] = [
        new ComponentBuilderAgent(),
        new LayoutAgent(),
        new StylingAgent(),
        new ButtonAgent(),
        new FormAgent(),
        new ModalAgent(),
        new TableAgent(),
        new CardAgent(),
        new NavigationAgent(),
        new ChartAgent(),
    ];
}

export const uiMiniOrchestrator = new UiMiniOrchestrator();
