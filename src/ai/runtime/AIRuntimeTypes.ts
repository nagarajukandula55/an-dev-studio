import { AgentRole } from "../../agents/types/AgentTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Runtime API - Types
 * ============================================================================
 */

export interface AIRuntimeRequest {
  requestId: string;
  input: string;

  context?: Record<string, unknown>;

  /**
   * Optional override: force specific agent
   */
  forceAgent?: AgentRole;

  /**
   * If true → bypass orchestrator planning
   */
  directMode?: boolean;
}

export interface AIRuntimeResponse {
  requestId: string;
  success: boolean;
  output: unknown;

  logs?: string[];
}