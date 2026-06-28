import { Agent } from "../core/Agent";
import { AgentRole } from "../types/AgentTypes";

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