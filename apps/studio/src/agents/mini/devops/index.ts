import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { DependencyAgent } from "./DependencyAgent";
import { BuildAgent } from "./BuildAgent";

class DevOpsMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "devops";
    readonly label = "DevOps";
    readonly description = "Dependency installation and build commands. (Deployment pipelines are a future addition.)";
    readonly microAgents: MicroAgent[] = [new DependencyAgent(), new BuildAgent()];
}

export const devopsMiniOrchestrator = new DevOpsMiniOrchestrator();
