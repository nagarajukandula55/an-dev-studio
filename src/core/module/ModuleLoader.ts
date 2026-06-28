import { ModuleDescriptor } from "./ModuleDescriptor";
import { ModuleRegistry } from "./ModuleRegistry";
import { ModuleState } from "./ModuleState";

/**
 * ============================================================================
 * AN Dev Studio
 * Module Loader
 * ============================================================================
 *
 * Executes module lifecycle.
 *
 * Responsibilities:
 *  - initialize
 *  - dispose
 *  - reload
 * ============================================================================
 */

export class ModuleLoader {

  /**
   * Initialize one module.
   */
  public static async initialize(
    descriptor: ModuleDescriptor
  ): Promise<void> {

    try {

      ModuleRegistry.setState(
        descriptor.module.id,
        ModuleState.INITIALIZING
      );

      const start = performance.now();

      await descriptor.module.initialize();

      descriptor.startupTime = performance.now() - start;
      descriptor.initializedAt = new Date();

      ModuleRegistry.setState(
        descriptor.module.id,
        ModuleState.RUNNING
      );

      ModuleRegistry.updateHealth(
        descriptor.module.id,
        true
      );

    }
    catch (error) {

      descriptor.error = error as Error;

      ModuleRegistry.setState(
        descriptor.module.id,
        ModuleState.FAILED
      );

      ModuleRegistry.updateHealth(
        descriptor.module.id,
        false,
        descriptor.error.message
      );

      throw error;

    }

  }

  /**
   * Dispose one module.
   */
  public static async dispose(
    descriptor: ModuleDescriptor
  ): Promise<void> {

    try {

      ModuleRegistry.setState(
        descriptor.module.id,
        ModuleState.STOPPING
      );

      if (descriptor.module.dispose) {
        await descriptor.module.dispose();
      }

      descriptor.disposedAt = new Date();

      ModuleRegistry.setState(
        descriptor.module.id,
        ModuleState.STOPPED
      );

    }
    catch (error) {

      descriptor.error = error as Error;

      ModuleRegistry.setState(
        descriptor.module.id,
        ModuleState.FAILED
      );

      ModuleRegistry.updateHealth(
        descriptor.module.id,
        false,
        descriptor.error.message
      );

      throw error;

    }

  }

  /**
   * Restart module.
   */
  public static async reload(
    descriptor: ModuleDescriptor
  ): Promise<void> {

    await this.dispose(descriptor);

    await this.initialize(descriptor);

  }

}