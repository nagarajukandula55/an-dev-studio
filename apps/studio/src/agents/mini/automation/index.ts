import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { ScriptAgent } from "./ScriptAgent";
import { CronJobAgent } from "./CronJobAgent";
import { DataPipelineAgent } from "./DataPipelineAgent";

class AutomationMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "automation";
    readonly label = "Automation";
    readonly description = "Standalone scripts, scheduled jobs, and data pipeline stages.";
    readonly microAgents: MicroAgent[] = [new ScriptAgent(), new CronJobAgent(), new DataPipelineAgent()];
}

export const automationMiniOrchestrator = new AutomationMiniOrchestrator();
