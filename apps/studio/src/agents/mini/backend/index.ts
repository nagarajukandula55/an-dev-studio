import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { ApiRouteAgent } from "./ApiRouteAgent";
import { BusinessLogicAgent } from "./BusinessLogicAgent";
import { AuthAgent } from "./AuthAgent";
import { MiddlewareAgent } from "./MiddlewareAgent";
import { ValidationAgent } from "./ValidationAgent";
import { WebhookAgent } from "./WebhookAgent";

class BackendMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "backend";
    readonly label = "Backend";
    readonly description = "API routes, business logic, auth, middleware, validation, and webhooks — one micro-agent per concern.";
    readonly microAgents: MicroAgent[] = [
        new ApiRouteAgent(),
        new BusinessLogicAgent(),
        new AuthAgent(),
        new MiddlewareAgent(),
        new ValidationAgent(),
        new WebhookAgent(),
    ];
}

export const backendMiniOrchestrator = new BackendMiniOrchestrator();
