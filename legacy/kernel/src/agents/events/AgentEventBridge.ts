import { EventBus } from "../../core/events/EventBus";
import { EventFactory } from "../../core/events/EventFactory";
import { AgentEventTypes } from "./AgentEventTypes";
import { AgentContext, AgentResult, AgentRole } from "../types/AgentTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Event Bridge
 * ============================================================================
 *
 * Connects Agent system to Event system.
 */

export class AgentEventBridge {
  public static emitStart(role: AgentRole, context: AgentContext): void {
    EventBus.emit(
      EventFactory.create(AgentEventTypes.AGENT_STARTED, {
        role,
        taskId: context.taskId,
      })
    );
  }

  public static emitComplete(role: AgentRole, result: AgentResult): void {
    EventBus.emit(
      EventFactory.create(AgentEventTypes.AGENT_COMPLETED, {
        role,
        success: result.success,
        output: result.output,
      })
    );
  }

  public static emitFailure(role: AgentRole, error: Error): void {
    EventBus.emit(
      EventFactory.create(AgentEventTypes.AGENT_FAILED, {
        role,
        message: error.message,
      })
    );
  }
}