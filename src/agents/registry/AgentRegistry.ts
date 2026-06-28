import { BaseAgent } from "../core/BaseAgent";
import { AgentRole } from "../types/AgentTypes";
import { ArchitectAgent } from "../core/ArchitectAgent";

/**
 * Central registry for all agents
 * Acts as the system brain directory
 */

export class AgentRegistry {
  private static agents: Map<AgentRole, BaseAgent> = new Map();

  static register(agent: BaseAgent) {
    this.agents.set(agent.getRole(), agent);
  }

  static get(role: AgentRole): BaseAgent | undefined {
    return this.agents.get(role);
  }

  static getAll(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
}

export function initializeDefaultAgents() {
  const architect = new ArchitectAgent();
  AgentRegistry.register(architect);
}