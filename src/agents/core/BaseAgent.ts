import { AgentContext, AgentResult, AgentRole } from "../types/AgentTypes";

/**
 * Base class for all AI Agents in AN Dev Studio
 * Every agent must extend this class
 */

export abstract class BaseAgent {
  protected role: AgentRole;

  constructor(role: AgentRole) {
    this.role = role;
  }

  getRole(): AgentRole {
    return this.role;
  }

  abstract execute(context: AgentContext): Promise<AgentResult>;
}