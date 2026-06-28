/**
 * ============================================================================
 * AN Dev Studio
 * AI Integration - Event Types
 * ============================================================================
 */

export const AgentEventTypes = {
  AGENT_STARTED: "agent.started",
  AGENT_COMPLETED: "agent.completed",
  AGENT_FAILED: "agent.failed",
  AGENT_TASK_ASSIGNED: "agent.task.assigned",
} as const;

export type AgentEventType =
  (typeof AgentEventTypes)[keyof typeof AgentEventTypes];