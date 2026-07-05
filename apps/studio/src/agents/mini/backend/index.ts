import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { ApiRouteAgent } from "./ApiRouteAgent";
import { BusinessLogicAgent } from "./BusinessLogicAgent";

class BackendMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "backend";
    readonly label = "Backend";
    readonly description = "API routes and server-side business logic.";
    readonly microAgents: MicroAgent[] = [new ApiRouteAgent(), new BusinessLogicAgent()];
}

export const backendMiniOrchestrator = new BackendMiniOrchestrator();
