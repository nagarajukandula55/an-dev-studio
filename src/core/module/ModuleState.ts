/**
 * ============================================================================
 * AN Dev Studio
 * Module State
 * ============================================================================
 *
 * Defines the lifecycle state of a module.
 *
 * State Flow:
 *
 * DISCOVERED
 *      ↓
 * REGISTERED
 *      ↓
 * INITIALIZING
 *      ↓
 * RUNNING
 *      ↓
 * STOPPING
 *      ↓
 * STOPPED
 *
 * Any state can transition to FAILED.
 * ============================================================================
 */

export enum ModuleState {

  /**
   * Module discovered but not yet registered.
   */
  DISCOVERED = "DISCOVERED",

  /**
   * Registered inside ModuleRegistry.
   */
  REGISTERED = "REGISTERED",

  /**
   * initialize() currently executing.
   */
  INITIALIZING = "INITIALIZING",

  /**
   * Module is active.
   */
  RUNNING = "RUNNING",

  /**
   * dispose() currently executing.
   */
  STOPPING = "STOPPING",

  /**
   * Module successfully stopped.
   */
  STOPPED = "STOPPED",

  /**
   * Module initialization or runtime failure.
   */
  FAILED = "FAILED",

}