import { ExecutionRecord } from "../memory/ExecutionMemory";

export interface GraphPolicy {
  disabledAgents: string[];
  priorityOrder: string[];
  repeatAgents: string[];
}

export class GraphPolicyEngine {
  generatePolicy(history: ExecutionRecord[]): GraphPolicy {
    const failed = history.filter(h => !h.success);
    const successRate = history.length
      ? history.filter(h => h.success).length / history.length
      : 1;

    // default policy
    const policy: GraphPolicy = {
      disabledAgents: [],
      priorityOrder: [
        "strategy",
        "longTermPlanning",
        "simulation",
        "crossDomainReasoning",
        "globalOptimization",
        "resourceAllocation",
      ],
      repeatAgents: [],
    };

    // 🔥 FAILURE DRIVEN OPTIMIZATION
    if (successRate < 0.7) {
      policy.repeatAgents.push("simulation");
      policy.priorityOrder.unshift("crossDomainReasoning");
    }

    // 🔥 STRATEGY FAILURE HANDLING
    if (failed.some(f => f.insights?.length === 0)) {
      policy.disabledAgents.push("globalOptimization");
    }

    // 🔥 RESOURCE INSTABILITY DETECTION
    if (failed.length > 3) {
      policy.priorityOrder = [
        "strategy",
        "simulation",
        "resourceAllocation",
        "globalOptimization",
      ];
    }

    return policy;
  }
}