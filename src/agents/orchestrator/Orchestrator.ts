import { AgentRuntime } from "../runtime/AgentRuntime";
import {
  OrchestrationResult,
  OrchestrationTask,
} from "./OrchestratorTypes";
import { SimplePlanner } from "./SimplePlanner";
import { AgentContext } from "../types/AgentTypes";

import { registerExecutiveAgents } from "../registry/AgentRegistry";
import { ExecutiveGraph } from "./ExecutiveGraph";

import { ExecutionMemory } from "./memory/ExecutionMemory";
import { GraphPolicyEngine } from "./policy/GraphPolicyEngine";
import { SelfEvolvingExecutiveGraph } from "./SelfEvolvingExecutiveGraph";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Orchestrator (Production Core)
 * ============================================================================
 *
 * Supports:
 * 1. Standard deterministic workflow execution
 * 2. Executive Intelligence Graph (multi-agent cognition system)
 * ============================================================================
 */

export class Orchestrator {
  private runtime: AgentRuntime;

  private executiveMode: boolean = false;
  private graph: ExecutiveGraph | null = null;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
  }

  // =========================================================
  // MODE CONTROL
  // =========================================================
  public enableExecutiveMode(): void {
    this.executiveMode = true;

    const registry = (this.runtime as any).registry;

    if (!registry) {
      throw new Error(
        "AgentRegistry not found in runtime. Cannot enable Executive Mode."
      );
    }

    registerExecutiveAgents(registry);

    this.graph = new ExecutiveGraph(registry);
  }

  public disableExecutiveMode(): void {
    this.executiveMode = false;
    this.graph = null;
  }

  // =========================================================
  // MAIN ENTRY POINT
  // =========================================================
  public async execute(
    task: OrchestrationTask
  ): Promise<OrchestrationResult> {
    if (this.executiveMode && this.graph) {
      return this.graph.execute(task);
    }

    return this.runStandardPipeline(task);
  }

  // =========================================================
  // STANDARD PIPELINE (LEGACY SAFE - DO NOT TOUCH)
  // =========================================================
  private async runStandardPipeline(
    task: OrchestrationTask
  ): Promise<OrchestrationResult> {
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