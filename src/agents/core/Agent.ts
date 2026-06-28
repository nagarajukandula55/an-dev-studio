import { AgentContext, AgentResult, AgentRole } from "../types/AgentTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * Base Agent Contract
 * ============================================================================
 */

export interface Agent {
  readonly role: AgentRole;

  execute(context: AgentContext): Promise<AgentResult>;
}