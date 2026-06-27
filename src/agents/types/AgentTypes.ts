/**
 * AN Dev Studio - Agent Types
 * Defines all roles in the multi-agent engineering system
 */

export enum AgentRole {
  ARCHITECT = "ARCHITECT",
  PLANNER = "PLANNER",
  BACKEND = "BACKEND",
  FRONTEND = "FRONTEND",
  QA = "QA",
  DEVOPS = "DEVOPS",
  REVIEWER = "REVIEWER",
  ORCHESTRATOR = "ORCHESTRATOR"
}

export interface AgentContext {
  taskId: string;
  repository: string;
  userRequest: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResult {
  success: boolean;
  output: unknown;
  logs?: string[];
  nextAction?: string;
}