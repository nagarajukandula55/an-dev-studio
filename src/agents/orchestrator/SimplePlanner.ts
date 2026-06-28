import { OrchestrationPlan, SubTask } from "./OrchestratorTypes";
import { AgentRole } from "../types/AgentTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * Simple Planner
 * ============================================================================
 *
 * Converts a request into structured subtasks.
 * (Later replaced by LLM-based planner)
 */

export class SimplePlanner {
  public static createPlan(taskId: string, request: string): OrchestrationPlan {
    const steps: SubTask[] = [];

    // VERY SIMPLE RULE-BASED PLANNING (v1)
    steps.push({
      id: `${taskId}-1`,
      role: AgentRole.ARCHITECT,
      instruction: `Analyze system design for: ${request}`,
    });

    steps.push({
      id: `${taskId}-2`,
      role: AgentRole.PLANNER,
      instruction: `Break down execution plan for: ${request}`,
    });

    steps.push({
      id: `${taskId}-3`,
      role: AgentRole.DEVELOPER,
      instruction: `Implement solution for: ${request}`,
    });

    steps.push({
      id: `${taskId}-4`,
      role: AgentRole.QA,
      instruction: `Validate output for: ${request}`,
    });

    return {
      rootTask: {
        taskId,
        request,
      },
      steps,
    };
  }
}