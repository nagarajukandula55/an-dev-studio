import { AgentRuntime } from "../runtime/AgentRuntime";
import {
  OrchestrationResult,
  OrchestrationTask,
} from "./OrchestratorTypes";
import { SimplePlanner } from "./SimplePlanner";
import { AgentContext } from "../types/AgentTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Orchestrator
 * ============================================================================
 *
 * Master controller for multi-agent execution.
 */

export class Orchestrator {
  private runtime: AgentRuntime;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
  }

  public async execute(task: OrchestrationTask): Promise<OrchestrationResult> {
    const plan = SimplePlanner.createPlan(task.taskId, task.request);

    const results = [];

    for (const step of plan.steps) {
      const context: AgentContext = {
        taskId: step.id,
        request: step.instruction,
        metadata: task.context,
      };

      const result = await this.runtime.run(step.role, context);

      results.push(result);
    }

    return {
      taskId: task.taskId,
      success: results.every((r) => r.success),
      results,
    };
  }
}