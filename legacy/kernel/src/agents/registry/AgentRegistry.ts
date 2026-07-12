import { Agent } from "../core/Agent";
import { AgentRole } from "../types/AgentTypes";
import { StrategyAgent } from "../impl/executive/StrategyAgent";
import { SimulationAgent } from "../impl/executive/SimulationAgent";
import { GlobalOptimizationAgent } from "../impl/executive/GlobalOptimizationAgent";
import { ResourceAllocationAgent } from "../impl/executive/ResourceAllocationAgent";
import { LongTermPlanningAgent } from "../impl/executive/LongTermPlanningAgent";
import { CrossDomainReasoningAgent } from "../impl/executive/CrossDomainReasoningAgent";

/**
 * ============================================================================
 * AN Dev Studio
 * Agent Registry
 * ============================================================================
 *
 * Stores all registered AI agents.
 */

export class AgentRegistry {
  private static agents: Map<AgentRole, Agent> = new Map();

  public static register(agent: Agent): void {
    if (this.agents.has(agent.role)) {
      throw new Error(`Agent already registered: ${agent.role}`);
    }

    this.agents.set(agent.role, agent);
  }

  public static get(role: AgentRole): Agent | undefined {
    return this.agents.get(role);
  }

  public static getAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  public static clear(): void {
    this.agents.clear();
  }
}

export function registerExecutiveAgents(registry: any) {
  registry.register("strategy", new StrategyAgent());
  registry.register("simulation", new SimulationAgent());
  registry.register("globalOptimization", new GlobalOptimizationAgent());
  registry.register("resourceAllocation", new ResourceAllocationAgent());
  registry.register("longTermPlanning", new LongTermPlanningAgent());
  registry.register("crossDomainReasoning", new CrossDomainReasoningAgent());
}