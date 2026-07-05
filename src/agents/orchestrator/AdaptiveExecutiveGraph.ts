import { ExecutiveGraph } from "./ExecutiveGraph";
import { ExecutionMemory } from "./memory/ExecutionMemory";

export class AdaptiveExecutiveGraph extends ExecutiveGraph {
  constructor(registry: any, private memory: ExecutionMemory) {
    super(registry);
  }

  async execute(task: any) {
    const baseline = await super.execute(task);

    this.memory.record({
      taskId: task.taskId,
      timestamp: Date.now(),
      graphSignature: "v1-graph",
      success: baseline.success,
      confidence: baseline.intelligence?.confidence || 0,
      insights: baseline.intelligence?.insights || [],
    });

    return this.adapt(baseline);
  }

  private adapt(result: any) {
    const failures = this.memory.getFailurePatterns();

    if (failures.length > 5) {
      return {
        ...result,
        optimizationHint: "reorder_agents_or_skip_simulation",
      };
    }

    return result;
  }
}