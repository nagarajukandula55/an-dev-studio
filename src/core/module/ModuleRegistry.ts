import { StudioModule } from "./Module";
import { ModuleDescriptor } from "./ModuleDescriptor";
import { ModuleState } from "./ModuleState";

/**
 * ============================================================================
 * AN Dev Studio
 * Module Registry
 * ============================================================================
 *
 * Central registry responsible for storing all modules and their runtime state.
 *
 * Responsibilities:
 * - Register modules
 * - Prevent duplicates
 * - Provide module lookup
 * - Provide module list
 */

export class ModuleRegistry {
  private static readonly modules = new Map<string, ModuleDescriptor>();

  /**
   * Register a module into the system.
   */
  public static register(module: StudioModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(`Module '${module.id}' is already registered.`);
    }

    const descriptor: ModuleDescriptor = {
      module,
      state: ModuleState.REGISTERED,
      registeredAt: new Date(),
    };

    this.modules.set(module.id, descriptor);
  }

  /**
   * Get module descriptor by ID.
   */
  public static get(id: string): ModuleDescriptor | undefined {
    return this.modules.get(id);
  }

  /**
   * Check if module exists.
   */
  public static has(id: string): boolean {
    return this.modules.has(id);
  }

  /**
   * Get all modules.
   */
  public static getAll(): readonly ModuleDescriptor[] {
    return Object.freeze(Array.from(this.modules.values()));
  }

  /**
   * Remove module from registry.
   */
  public static unregister(id: string): boolean {
    return this.modules.delete(id);
  }

  /**
   * Clear registry (testing only).
   */
  public static clear(): void {
    this.modules.clear();
  }

  /**
   * Count modules.
   */
  public static count(): number {
    return this.modules.size;
  }
}