import { ModuleRegistry } from "./ModuleRegistry";
import { StudioModule } from "./Module";
import { ModuleState } from "./ModuleState";
import { ModuleDescriptor } from "./ModuleDescriptor";

/**
 * ============================================================================
 * AN Dev Studio
 * Module Manager
 * ============================================================================
 *
 * Responsible for module lifecycle execution.
 *
 * Responsibilities:
 * - Initialize modules
 * - Dispose modules
 * - Track lifecycle state
 */

export class ModuleManager {
  /**
   * Initialize a single module.
   */
  public static async initialize(module: StudioModule): Promise<void> {
    const descriptor = ModuleRegistry.get(module.id);

    if (!descriptor) {
      throw new Error(`Module not registered: ${module.id}`);
    }

    await this.runInitialization(descriptor);
  }

  /**
   * Initialize all modules.
   */
  public static async initializeAll(): Promise<void> {
    const modules = ModuleRegistry.getAll();

    for (const descriptor of modules) {
      await this.runInitialization(descriptor);
    }
  }

  /**
   * Dispose a single module.
   */
  public static async dispose(module: StudioModule): Promise<void> {
    const descriptor = ModuleRegistry.get(module.id);

    if (!descriptor) return;

    await this.runDisposal(descriptor);
  }

  /**
   * Dispose all modules in reverse order.
   */
  public static async disposeAll(): Promise<void> {
    const modules = [...ModuleRegistry.getAll()].reverse();

    for (const descriptor of modules) {
      await this.runDisposal(descriptor);
    }
  }

  /**
   * Internal initialization flow.
   */
  private static async runInitialization(descriptor: ModuleDescriptor): Promise<void> {
    try {
      descriptor.state = ModuleState.INITIALIZING;

      const start = performance.now();

      await descriptor.module.initialize();

      descriptor.startupTime = performance.now() - start;
      descriptor.initializedAt = new Date();
      descriptor.state = ModuleState.RUNNING;
    } catch (error) {
      descriptor.state = ModuleState.FAILED;
      descriptor.error = error as Error;
      throw error;
    }
  }

  /**
   * Internal disposal flow.
   */
  private static async runDisposal(descriptor: ModuleDescriptor): Promise<void> {
    try {
      descriptor.state = ModuleState.STOPPING;

      if (descriptor.module.dispose) {
        await descriptor.module.dispose();
      }

      descriptor.state = ModuleState.STOPPED;
    } catch (error) {
      descriptor.state = ModuleState.FAILED;
      descriptor.error = error as Error;
      throw error;
    }
  }
}