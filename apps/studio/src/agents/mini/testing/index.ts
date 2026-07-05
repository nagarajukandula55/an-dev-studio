import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { UnitTestAgent } from "./UnitTestAgent";
import { TestRunnerAgent } from "./TestRunnerAgent";

class TestingMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "testing";
    readonly label = "Testing";
    readonly description = "Writing and running automated tests.";
    readonly microAgents: MicroAgent[] = [new UnitTestAgent(), new TestRunnerAgent()];
}

export const testingMiniOrchestrator = new TestingMiniOrchestrator();
