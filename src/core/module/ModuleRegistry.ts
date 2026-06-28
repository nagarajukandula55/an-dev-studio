import { StudioModule } from "./Module";

/**
 * ============================================================================
 * AN Dev Studio
 * Module Registry
 * ----------------------------------------------------------------------------
 * Central registry responsible for tracking all modules available
 * within the platform.
 *
 * Responsibilities:
 * - Register modules
 * - Prevent duplicate registrations
 * - Discover modules
 * - Unregister modules
 *
 * NOTE:
 * Module lifecycle (initialize/dispose) is handled by ModuleManager.
 * ============================================================================
 */
export class ModuleRegistry {
  private static readonly modules = new Map<string, StudioModule>();

  /**
   * Register a module.
   *
   * @throws Error if a module with the same ID already exists.
   */
  public static register(module: StudioModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(`Module '${module.id}' is already registered.`);
    }

    this.modules.set(module.id, module);
  }

  /**
   * Remove a module from the registry.
   */
  public static unregister(id: string): boolean {
    return this.modules.delete(id);
  }

  /**
   * Returns true if the module exists.
   */
  public static has(id: string): boolean {
    return this.modules.has(id);
  }

  /**
   * Get a module by ID.
   */
  public static get(id: string): StudioModule | undefined {
    return this.modules.get(id);
  }

  /**
   * Returns every registered module.
   */
  public static getAll(): readonly StudioModule[] {
    return Object.freeze(Array.from(this.modules.values()));
  }

  /**
   * Number of registered modules.
   */
  public static count(): number {
    return this.modules.size;
  }

  /**
   * Clears the registry.
   *
   * Intended for testing.
   */
  public static clear(): void {
    this.modules.clear();
  }
}