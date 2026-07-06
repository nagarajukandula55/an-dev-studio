import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { DependencyAgent } from "./DependencyAgent";
import { BuildAgent } from "./BuildAgent";
import { CiConfigAgent } from "./CiConfigAgent";
import { DockerfileAgent } from "./DockerfileAgent";
import { EnvConfigAgent } from "./EnvConfigAgent";

class DevOpsMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "devops";
    readonly label = "DevOps";
    readonly description = "Dependency installation, builds, CI pipelines, containerization, and environment config.";
    readonly microAgents: MicroAgent[] = [
        new DependencyAgent(),
        new BuildAgent(),
        new CiConfigAgent(),
        new DockerfileAgent(),
        new EnvConfigAgent(),
    ];
}

export const devopsMiniOrchestrator = new DevOpsMiniOrchestrator();
