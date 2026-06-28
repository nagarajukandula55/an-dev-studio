import { StudioModule } from "./Module";
import { ModuleDescriptor } from "./ModuleDescriptor";
import { ModuleLoader } from "./ModuleLoader";
import { ModuleRegistry } from "./ModuleRegistry";

/**
 * ============================================================================
 * AN Dev Studio
 * Module Manager
 * ============================================================================
 *
 * Central orchestration layer for module lifecycle management.
 *
 * Responsibilities:
 *  - Register modules
 *  - Unregister modules
 *  - Initialize modules
 *  - Dispose modules
 *  - Restart modules
 *  - Bulk lifecycle operations
 *
 * NOTE:
 * ModuleManager DOES NOT execute lifecycle logic itself.
 * That responsibility belongs to ModuleLoader.
 * ============================================================================
 */
export class ModuleManager {

  /**
   * Register a module.
   */
  public static register(module: StudioModule): ModuleDescriptor {
    return ModuleRegistry.register(module);
  }

  /**
   * Register multiple modules.
   */
  public static registerMany(
    modules: readonly StudioModule[]
  ): readonly ModuleDescriptor[] {

    return modules.map(module => this.register(module));

  }

  /**
   * Unregister module.
   */
  public static unregister(id: string): boolean {
    return ModuleRegistry.unregister(id);
  }

  /**
   * Initialize one module.
   */
  public static async initialize(
    module: StudioModule
  ): Promise<void> {

    const descriptor = ModuleRegistry.get(module.id);

    if (!descriptor) {
      throw new Error(`Module '${module.id}' is not registered.`);
    }

    await ModuleLoader.initialize(descriptor);

  }

  /**
   * Initialize module by id.
   */
  public static async initializeById(
    id: string
  ): Promise<void> {

    const descriptor = ModuleRegistry.get(id);

    if (!descriptor) {
      throw new Error(`Module '${id}' is not registered.`);
    }

    await ModuleLoader.initialize(descriptor);

  }

  /**
   * Initialize every registered module.
   */
  public static async initializeAll(): Promise<void> {

    for (const descriptor of ModuleRegistry.getAll()) {
      await ModuleLoader.initialize(descriptor);
    }

  }

  /**
   * Dispose one module.
   */
  public static async dispose(
    module: StudioModule
  ): Promise<void> {

    const descriptor = ModuleRegistry.get(module.id);

    if (!descriptor) {
      return;
    }

    await ModuleLoader.dispose(descriptor);

  }

  /**
   * Dispose module by id.
   */
  public static async disposeById(
    id: string
  ): Promise<void> {

    const descriptor = ModuleRegistry.get(id);

    if (!descriptor) {
      return;
    }

    await ModuleLoader.dispose(descriptor);

  }

  /**
   * Dispose all modules.
   *
   * Reverse order prevents dependency issues.
   */
  public static async disposeAll(): Promise<void> {

    const descriptors = [...ModuleRegistry.getAll()].reverse();

    for (const descriptor of descriptors) {
      await ModuleLoader.dispose(descriptor);
    }

  }

  /**
   * Restart module.
   */
  public static async restart(
    id: string
  ): Promise<void> {

    const descriptor = ModuleRegistry.get(id);

    if (!descriptor) {
      throw new Error(`Module '${id}' is not registered.`);
    }

    await ModuleLoader.reload(descriptor);

  }

  /**
   * Get descriptor.
   */
  public static get(
    id: string
  ): ModuleDescriptor | undefined {

    return ModuleRegistry.get(id);

  }

  /**
   * Get all modules.
   */
  public static getAll(): readonly ModuleDescriptor[] {

    return ModuleRegistry.getAll();

  }

  /**
   * Check if module exists.
   */
  public static has(
    id: string
  ): boolean {

    return ModuleRegistry.has(id);

  }

  /**
   * Number of registered modules.
   */
  public static count(): number {

    return ModuleRegistry.count();

  }

}