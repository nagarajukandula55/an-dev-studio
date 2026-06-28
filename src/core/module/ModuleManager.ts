import { ModuleRegistry } from "./ModuleRegistry";
import { StudioModule } from "./Module";

/**
 * ============================================================================
 * AN Dev Studio
 * Module Manager
 * ----------------------------------------------------------------------------
 * Responsible for managing the lifecycle of registered modules.
 *
 * Responsibilities:
 * - Initialize modules
 * - Dispose modules
 * - Initialize all modules
 * - Dispose all modules
 *
 * NOTE:
 * Registration is handled by ModuleRegistry.
 * ============================================================================
 */
export class ModuleManager {
  /**
   * Initialize a single module.
   */
  public static async initialize(module: StudioModule): Promise<void> {
    await module.initialize();
  }

  /**
   * Initialize every registered module.
   */
  public static async initializeAll(): Promise<void> {
    const modules = ModuleRegistry.getAll();

    for (const module of modules) {
      await module.initialize();
    }
  }

  /**
   * Dispose a single module.
   */
  public static async dispose(module: StudioModule): Promise<void> {
    if (module.dispose) {
      await module.dispose();
    }
  }

  /**
   * Dispose every registered module.
   */
  public static async disposeAll(): Promise<void> {
    const modules = [...ModuleRegistry.getAll()].reverse();

    for (const module of modules) {
      if (module.dispose) {
        await module.dispose();
      }
    }
  }
}