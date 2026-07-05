import { ExecutionMemory } from "./memory/ExecutionMemory";
import { GraphPolicyEngine } from "./policy/GraphPolicyEngine";

export class SelfEvolvingExecutiveGraph {
  constructor(
    private registry: any,
    private memory: ExecutionMemory,
    private policyEngine: GraphPolicyEngine
  ) {}

  async execute(task: any) {
    const history = this.memory.getRecent(50);
    const policy = this.policyEngine.generatePolicy(history);

    const goal = task.request;
    const context = task.context || {};

    const runAgent = async (name: string, input: any) => {
      if (policy.disabledAgents.includes(name)) return null;
      return this.registry.get(name).execute(input);
    };

    // ===========================
    // STRATEGY FIRST (always)
    // ===========================
    const strategy = await runAgent("strategy", { goal, context });

    // ===========================
    // CONDITIONAL EXECUTION ORDER
    // ===========================
    const planning = await runAgent("longTermPlanning", { goal, context: strategy });

    const simulation = policy.repeatAgents.includes("simulation")
      ? await runAgent("simulation", { goal, context: planning })
      : await runAgent("simulation", { goal, context: planning });

    const crossDomain = await runAgent("crossDomainReasoning", {
      goal,
      context: simulation,
    });

    const optimization = await runAgent("globalOptimization", {
      goal,
      context: crossDomain,
    });

    const allocation = await runAgent("resourceAllocation", {
      goal,
      context: optimization,
    });

    const result = {
      taskId: task.taskId,
      success: true,
      policyUsed: policy,
      results: {
        strategy,
        planning,
        simulation,
        crossDomain,
        optimization,
        allocation,
      },
    };

    // 🔥 FEEDBACK LOOP
    this.memory.record({
      taskId: task.taskId,
      timestamp: Date.now(),
      graphSignature: JSON.stringify(policy),
      success: true,
      confidence: optimization?.confidence || 0,
      insights: optimization?.insights || [],
    });

    return result;
  }
}