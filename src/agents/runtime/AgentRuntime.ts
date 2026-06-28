import { AgentContext, AgentResult, AgentRole } from "../types/AgentTypes";
import { AgentRegistry } from "../registry/AgentRegistry";
import { initializeDefaultAgents } from "../registry/AgentRegistry";

/**
 * Agent Runtime
 * Responsible for executing agents and managing workflow
 */

export class AgentRuntime {
  constructor() {
    initializeDefaultAgents();
  }

  async run(role: AgentRole, context: AgentContext): Promise<AgentResult> {
    const agent = AgentRegistry.get(role);

    if (!agent) {
      throw new Error(`Agent not found: ${role}`);
    }

    return await agent.execute(context);
  }
}