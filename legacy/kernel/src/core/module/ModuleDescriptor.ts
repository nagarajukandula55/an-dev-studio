import { StudioModule } from "./Module";
import { ModuleHealth } from "./ModuleHealth";
import { ModuleState } from "./ModuleState";

/**
 * ============================================================================
 * AN Dev Studio
 * Module Descriptor
 * ============================================================================
 *
 * Runtime representation of a registered module.
 *
 * StudioModule itself is immutable.
 * All runtime information belongs here.
 * ============================================================================
 */

export interface ModuleDescriptor {

  /**
   * Static module definition.
   */
  readonly module: StudioModule;

  /**
   * Current runtime state.
   */
  state: ModuleState;

  /**
   * Module health.
   */
  health: ModuleHealth;

  /**
   * Registration timestamp.
   */
  readonly registeredAt: Date;

  /**
   * Initialization timestamp.
   */
  initializedAt?: Date;

  /**
   * Disposal timestamp.
   */
  disposedAt?: Date;

  /**
   * Startup duration (ms).
   */
  startupTime?: number;

  /**
   * Last runtime error.
   */
  error?: Error;
}