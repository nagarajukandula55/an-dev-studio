/**
 * ============================================================================
 * AN Dev Studio
 * Module State
 * ============================================================================
 *
 * Represents lifecycle state of a module.
 */

export enum ModuleState {
  DISCOVERED = "DISCOVERED",
  REGISTERED = "REGISTERED",
  INITIALIZING = "INITIALIZING",
  RUNNING = "RUNNING",
  STOPPING = "STOPPING",
  STOPPED = "STOPPED",
  FAILED = "FAILED",
}