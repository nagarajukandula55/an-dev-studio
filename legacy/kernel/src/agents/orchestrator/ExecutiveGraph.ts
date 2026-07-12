import { AgentRegistry } from "../registry/AgentRegistry";
import { OrchestrationTask } from "./OrchestratorTypes";

export class ExecutiveGraph {
  constructor(private registry: any) {}

  // =========================================================
  // PARALLEL EXECUTION LAYER
  // =========================================================
  async execute(task: OrchestrationTask) {
    const goal = task.request;
    const context = task.context || {};

    // ===========================
    // STAGE 1 - PARALLEL BRAINS
    // ===========================
    const [
      strategy,
      planning,
      simulation,
      crossDomain,
    ] = await Promise.all([
      this.registry.get("strategy").execute({ goal, context }),
      this.registry.get("longTermPlanning").execute({ goal, context }),
      this.registry.get("simulation").execute({ goal, context }),
      this.registry.get("crossDomainReasoning").execute({ goal, context }),
    ]);

    // ===========================
    // STAGE 2 - DEPENDENT OPTIMIZATION
    // ===========================
    const optimization = await this.registry
      .get("globalOptimization")
      .execute({
        goal,
        context: {
          strategy,
          planning,
          simulation,
          crossDomain,
        },
      });

    // ===========================
    // STAGE 3 - RESOURCE FINALIZATION
    // ===========================
    const allocation = await this.registry
      .get("resourceAllocation")
      .execute({
        goal,
        context: optimization,
      });

    // ===========================
    // STAGE 4 - MERGE INTELLIGENCE
    // ===========================
    return this.mergeResults(task.taskId, {
      strategy,
      planning,
      simulation,
      crossDomain,
      optimization,
      allocation,
    });
  }

  // =========================================================
  // INTELLIGENCE MERGE LAYER
  // =========================================================
  private mergeResults(taskId: string, data: any) {
    const allInsights = Object.values(data)
      .flat()
      .filter((x: any) => x?.insights)
      .flatMap((x: any) => x.insights);

    const allDecisions = Object.values(data)
      .filter((x: any) => x?.decisions)
      .reduce((acc: any, curr: any) => {
        return { ...acc, ...curr.decisions };
      }, {});

    const avgConfidence =
      Object.values(data)
        .filter((x: any) => x?.confidence)
        .reduce((sum: number, x: any) => sum + x.confidence, 0) /
      Object.keys(data).length;

    return {
      taskId,
      success: true,
      results: data,
      intelligence: {
        insights: allInsights,
        decisions: allDecisions,
        confidence: avgConfidence,
      },
    };
  }
}