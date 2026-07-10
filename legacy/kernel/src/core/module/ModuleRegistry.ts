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
 * Central runtime registry for all modules.
 *
 * Responsibilities
 *
 * • Register modules
 * • Prevent duplicate registration
 * • Store runtime descriptors
 * • Manage lifecycle state
 * • Maintain module health
 * • Query modules
 * • Runtime monitoring
 *
 * ============================================================================
 */

export class ModuleRegistry {

    private static readonly modules = new Map<string, ModuleDescriptor>();

    /**
     * Register a module.
     */
    public static register(module: StudioModule): ModuleDescriptor {

        if (this.modules.has(module.id)) {
            throw new Error(
                `Module '${module.id}' is already registered.`
            );
        }

        const health: ModuleHealth = {
            healthy: true,
            failures: 0,
            lastCheck: new Date(),
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
    public static get(
        id: string
    ): ModuleDescriptor | undefined {

        return this.modules.get(id);

    }

    /**
     * Check existence.
     */
    public static has(
        id: string
    ): boolean {

        return this.modules.has(id);

    }

    /**
     * Remove module.
     *
     * Running modules cannot be removed.
     */
    public static unregister(
        id: string
    ): boolean {

        const descriptor = this.modules.get(id);

        if (!descriptor) {
            return false;
        }

        if (descriptor.state === ModuleState.RUNNING) {
            throw new Error(
                `Cannot unregister running module '${id}'. Dispose it first.`
            );
        }

        return this.modules.delete(id);

    }

    /**
     * Get all module descriptors.
     */
    public static getAll(): readonly ModuleDescriptor[] {

        return Object.freeze(
            [...this.modules.values()]
        );

    }

    /**
     * Get modules sorted by priority.
     *
     * Lower priority value starts first.
     */
    public static getAllByPriority(): readonly ModuleDescriptor[] {

        return Object.freeze(

            [...this.modules.values()].sort(
                (a, b) =>
                    (a.module.priority ?? 1000) -
                    (b.module.priority ?? 1000)
            )

        );

    }

    /**
     * Find by category.
     */
    public static findByCategory(
        category: StudioModule["category"]
    ): readonly ModuleDescriptor[] {

        return this.getAll().filter(
            d => d.module.category === category
        );

    }

    /**
     * Find modules by tag.
     */
    public static findByTag(
        tag: string
    ): readonly ModuleDescriptor[] {

        return this.getAll().filter(
            d => d.module.tags?.includes(tag)
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
     * Update lifecycle state.
     */
    public static setState(
        id: string,
        state: ModuleState
    ): void {

        const descriptor = this.modules.get(id);

        if (!descriptor) {
            throw new Error(
                `Module '${id}' not found.`
            );
        }

        descriptor.state = state;

    }

    /**
     * Update runtime health.
     */
    public static updateHealth(
        id: string,
        healthy: boolean,
        message?: string
    ): void {

        const descriptor = this.modules.get(id);

        if (!descriptor) {
            throw new Error(
                `Module '${id}' not found.`
            );
        }

        descriptor.health.healthy = healthy;
        descriptor.health.lastCheck = new Date();
        descriptor.health.message = message;

        if (!healthy) {
            descriptor.health.failures++;
        }

    }

    /**
     * Framework health summary.
     */
    public static healthSummary() {

        const modules = this.getAll();

        return {

            total: modules.length,

            healthy: modules.filter(
                m => m.health.healthy
            ).length,

            unhealthy: modules.filter(
                m => !m.health.healthy
            ).length,

            running: modules.filter(
                m => m.state === ModuleState.RUNNING
            ).length,

            failed: modules.filter(
                m => m.state === ModuleState.FAILED
            ).length,

        };

    }

    /**
     * Remove every module.
     *
     * Intended for testing only.
     */
    public static clear(): void {

        this.modules.clear();

    }

    /**
     * Number of registered modules.
     */
    public static count(): number {

        return this.modules.size;

    }

}