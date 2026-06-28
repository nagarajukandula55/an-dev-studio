/**
 * ============================================================================
 * AN Dev Studio
 * Event Map
 * ============================================================================
 *
 * Defines every strongly typed event in the framework.
 *
 * Adding a new event here automatically enables IntelliSense
 * across the EventBus.
 * ============================================================================
 */

/**
 * Module gap detected.
 */
export interface ModuleGapPayload {

  gap: string;

}

/**
 * Module initialized.
 */
export interface ModuleInitializedPayload {

  moduleId: string;

  name: string;

  startupTime?: number;

}

/**
 * Module failed.
 */
export interface ModuleFailedPayload {

  moduleId: string;

  name: string;

  error?: string;

}

/**
 * System boot.
 */
export interface SystemBootPayload {

  time: number;

}

/**
 * ============================================================================
 * Event Registry
 * ============================================================================
 */

export interface EventMap {

  "module.gap.detected": ModuleGapPayload;

  "module.initialized": ModuleInitializedPayload;

  "module.failed": ModuleFailedPayload;

  "system.boot": SystemBootPayload;

}