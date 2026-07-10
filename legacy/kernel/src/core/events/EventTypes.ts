/**
 * ============================================================================
 * AN Dev Studio
 * Event System - Event Types
 * ============================================================================
 *
 * Central registry of system-wide events.
 * This ensures consistency and avoids string duplication.
 */

export const EventTypes = {
  // Module lifecycle events
  MODULE_REGISTERED: "module.registered",
  MODULE_INITIALIZED: "module.initialized",
  MODULE_STARTED: "module.started",
  MODULE_STOPPED: "module.stopped",
  MODULE_FAILED: "module.failed",

  // System events
  SYSTEM_BOOT: "system.boot",
  SYSTEM_READY: "system.ready",

  // Generic events
  ERROR: "system.error",
  LOG: "system.log",
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];