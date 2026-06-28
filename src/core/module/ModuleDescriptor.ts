import { StudioModule } from "./Module";
import { ModuleState } from "./ModuleState";

/**
 * ============================================================================
 * AN Dev Studio
 * Module Descriptor
 * ============================================================================
 *
 * Runtime wrapper around a module instance.
 * Stores lifecycle + metadata.
 */

export interface ModuleDescriptor {
  readonly module: StudioModule;

  state: ModuleState;

  readonly registeredAt: Date;

  initializedAt?: Date;

  startupTime?: number;

  error?: Error;
}