/**
 * ============================================================================
 * AN Dev Studio
 * Module Health
 * ============================================================================
 */

export interface ModuleHealth {

  /**
   * Whether module is currently healthy.
   */
  healthy: boolean;

  /**
   * Last successful health check.
   */
  lastCheck: Date;

  /**
   * Number of runtime failures.
   */
  failures: number;

  /**
   * Optional health message.
   */
  message?: string;
}