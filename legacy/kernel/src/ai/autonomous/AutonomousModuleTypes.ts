import { AgentRole } from "../../agents/types/AgentTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * Autonomous Module System - Types
 * ============================================================================
 */

export interface ModuleSpec {
  name: string;
  purpose: string;

  /**
   * Which agent suggested this module
   */
  suggestedBy: AgentRole;

  /**
   * High-level capabilities
   */
  capabilities: string[];
}

export interface GeneratedModule {
  id: string;
  spec: ModuleSpec;

  /**
   * Generated code representation (future expansion)
   */
  code?: string;
}