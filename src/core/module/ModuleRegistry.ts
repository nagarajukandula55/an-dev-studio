import { StudioModule } from "./Module";
import { ModuleDescriptor } from "./ModuleDescriptor";
import { ModuleHealth } from "./ModuleHealth";
import { ModuleState } from "./ModuleState";

/**
 * ============================================================================
 * AN Dev Studio
 * Module Registry
 * ============================================================================
 *
 * Stores all runtime module descriptors.
 *
 * Responsibilities:
 *  - Register modules
 *  - Prevent duplicates
 *  - Lookup modules
 *  - Maintain runtime state
 * ============================================================================
 */

export class ModuleRegistry {

  private static readonly modules = new Map<string, ModuleDescriptor>();

  /**
   * Register a module.
   */
  public static register(module: StudioModule): ModuleDescriptor {

    if (this.modules.has(module.id)) {
      throw new Error(`Module '${module.id}' is already registered.`);
    }

    const health: ModuleHealth = {
      healthy: true,
      lastCheck: new Date(),
      failures: 0,
    };

    const descriptor: ModuleDescriptor = {

      module,

      state: ModuleState.REGISTERED,

      health,

      registeredAt: new Date(),

    };

    this.modules.set(module.id, descriptor);

    return descriptor;

  }

  /**
   * Get module descriptor.
   */
  public static get(id: string): ModuleDescriptor | undefined {
    return this.modules.get(id);
  }

  /**
   * Check existence.
   */
  public static has(id: string): boolean {
    return this.modules.has(id);
  }

  /**
   * Remove module.
   */
  public static unregister(id: string): boolean {
    return this.modules.delete(id);
  }

  /**
   * Get all descriptors.
   */
  public static getAll(): readonly ModuleDescriptor[] {
    return Object.freeze([...this.modules.values()]);
  }

  /**
   * Get modules by category.
   */
  public static findByCategory(
    category: StudioModule["category"]
  ): readonly ModuleDescriptor[] {

    return this.getAll().filter(
      d => d.module.category === category
    );

  }

  /**
   * Get running modules.
   */
  public static getRunning(): readonly ModuleDescriptor[] {

    return this.getAll().filter(
      d => d.state === ModuleState.RUNNING
    );

  }

  /**
   * Update module state.
   */
  public static setState(
    id: string,
    state: ModuleState
  ): void {

    const descriptor = this.modules.get(id);

    if (!descriptor) {
      throw new Error(`Module '${id}' not found.`);
    }

    descriptor.state = state;

  }

  /**
   * Update module health.
   */
  public static updateHealth(
    id: string,
    healthy: boolean,
    message?: string
  ): void {

    const descriptor = this.modules.get(id);

    if (!descriptor) {
      throw new Error(`Module '${id}' not found.`);
    }

    descriptor.health.healthy = healthy;
    descriptor.health.lastCheck = new Date();
    descriptor.health.message = message;

    if (!healthy) {
      descriptor.health.failures++;
    }

  }

  /**
   * Remove everything.
   */
  public static clear(): void {
    this.modules.clear();
  }

  /**
   * Number of modules.
   */
  public static count(): number {
    return this.modules.size;
  }

}