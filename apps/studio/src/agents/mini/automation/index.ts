import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { ScriptAgent } from "./ScriptAgent";

class AutomationMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "automation";
    readonly label = "Automation";
    readonly description = "Standalone scripts and workflow automation.";
    readonly microAgents: MicroAgent[] = [new ScriptAgent()];
}

export const automationMiniOrchestrator = new AutomationMiniOrchestrator();
