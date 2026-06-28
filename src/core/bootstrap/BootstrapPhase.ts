/**
 * ============================================================================
 * AN Dev Studio
 * Bootstrap Phases
 * ============================================================================
 *
 * Defines ordered system initialization stages.
 */

export enum BootstrapPhase {
  CONFIGURATION = "CONFIGURATION",
  SERVICES = "SERVICES",
  EVENTS = "EVENTS",
  MODULES = "MODULES",
  COMPLETE = "COMPLETE",
}