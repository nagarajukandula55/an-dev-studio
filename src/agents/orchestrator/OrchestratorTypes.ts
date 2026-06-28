import { AgentRole, AgentContext, AgentResult } from "../types/AgentTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * Orchestrator Types
 * ============================================================================
 */

export interface OrchestrationTask {
  taskId: string;
  request: string;

  context?: Record<string, unknown>;
}

export interface SubTask {
  id: string;
  role: AgentRole;
  instruction: string;
}

export interface OrchestrationPlan {
  rootTask: OrchestrationTask;
  steps: SubTask[];
}

export interface OrchestrationResult {
  taskId: string;
  success: boolean;
  results: AgentResult[];
}