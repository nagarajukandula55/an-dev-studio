import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { UnitTestAgent } from "./UnitTestAgent";
import { TestRunnerAgent } from "./TestRunnerAgent";
import { IntegrationTestAgent } from "./IntegrationTestAgent";
import { E2ETestAgent } from "./E2ETestAgent";
import { CoverageAgent } from "./CoverageAgent";

class TestingMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "testing";
    readonly label = "Testing";
    readonly description = "Writing and running automated tests — unit, integration, end-to-end, and coverage.";
    readonly microAgents: MicroAgent[] = [
        new UnitTestAgent(),
        new TestRunnerAgent(),
        new IntegrationTestAgent(),
        new E2ETestAgent(),
        new CoverageAgent(),
    ];
}

export const testingMiniOrchestrator = new TestingMiniOrchestrator();
