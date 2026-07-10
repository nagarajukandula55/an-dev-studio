import { AgentRegistry } from "../registry/AgentRegistry";
import {
  AgentContext,
  AgentResult,
  AgentRole,
} from "../types/AgentTypes";
import { AgentEventBridge } from "../events/AgentEventBridge";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Agent Runtime (Integrated)
 * ============================================================================
 */

export class AgentRuntime {
  public async run(
    role: AgentRole,
    context: AgentContext
  ): Promise<AgentResult> {
    const agent = AgentRegistry.get(role);

    if (!agent) {
      const error = new Error(`Agent not found: ${role}`);
      AgentEventBridge.emitFailure(role, error);

      return {
        success: false,
        output: null,
        logs: [error.message],
      };
    }

    try {
      // Emit start event
      AgentEventBridge.emitStart(role, context);

      // Execute agent
      const result = await agent.execute(context);

      // Emit completion event
      AgentEventBridge.emitComplete(role, result);

      return result;
    } catch (error) {
      const err = error as Error;

      // Emit failure event
      AgentEventBridge.emitFailure(role, err);

      return {
        success: false,
        output: null,
        logs: [err.message],
      };
    }
  }
}