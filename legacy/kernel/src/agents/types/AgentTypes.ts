/**
 * ============================================================================
 * AN Dev Studio
 * AI Agent System - Types
 * ============================================================================
 *
 * Defines roles in the multi-agent system.
 */

export enum AgentRole {
  ARCHITECT = "ARCHITECT",
  PLANNER = "PLANNER",
  DEVELOPER = "DEVELOPER",
  QA = "QA",
  DEVOPS = "DEVOPS",
  REVIEWER = "REVIEWER",
  ORCHESTRATOR = "ORCHESTRATOR",
}

/**
 * Input context passed to an agent
 */
export interface AgentContext {
  taskId: string;
  request: string;
  repository?: string;

  metadata?: Record<string, unknown>;
}

/**
 * Result returned by an agent
 */
export interface AgentResult {
  success: boolean;
  output: unknown;
  logs?: string[];
  nextAction?: string;
}

export type ExecutiveAgentName =
  | "strategy"
  | "simulation"
  | "globalOptimization"
  | "resourceAllocation"
  | "longTermPlanning"
  | "crossDomainReasoning";

export interface ExecutiveAgentInput {
  goal: string;
  context: Record<string, any>;
  constraints?: Record<string, any>;
  history?: any[];
  metadata?: Record<string, any>;
}

export interface ExecutiveAgentOutput {
  insights: string[];
  decisions: Record<string, any>;
  confidence: number;
  nextActions: string[];
  metadata?: Record<string, any>;
}