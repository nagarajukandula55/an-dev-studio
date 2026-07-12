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
 * Central orchestration layer responsible for module lifecycle management.
 *
 * Responsibilities
 *
 * • Register modules
 * • Unregister modules
 * • Initialize modules
 * • Dispose modules
 * • Restart modules
 * • Bulk lifecycle operations
 *
 * NOTE:
 * ModuleManager orchestrates.
 * ModuleLoader executes lifecycle.
 *
 * ============================================================================
 */

export class ModuleManager {

    /**
     * Register module.
     */
    public static register(
        module: StudioModule
    ): ModuleDescriptor {

        return ModuleRegistry.register(module);

    }

    /**
     * Register multiple modules.
     */
    public static registerMany(
        modules: readonly StudioModule[]
    ): readonly ModuleDescriptor[] {

        return modules.map(module =>
            this.register(module)
        );

    }

    /**
     * Unregister module.
     */
    public static unregister(
        id: string
    ): boolean {

        return ModuleRegistry.unregister(id);

    }

    /**
     * Initialize module.
     */
    public static async initialize(
        module: StudioModule
    ): Promise<void> {

        await ModuleLoader.initialize(
            this.requireDescriptor(module.id)
        );

    }

    /**
     * Initialize by id.
     */
    public static async initializeById(
        id: string
    ): Promise<void> {

        await ModuleLoader.initialize(
            this.requireDescriptor(id)
        );

    }

    /**
     * Initialize every module.
     *
     * Modules start according to priority.
     */
    public static async initializeAll(): Promise<void> {

        await ModuleLoader.initializeMany(
            ModuleRegistry.getAllByPriority()
        );

    }

    /**
     * Dispose module.
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
     * Dispose by id.
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

        await ModuleLoader.disposeMany(
            ModuleRegistry.getAll()
        );

    }

    /**
     * Restart module.
     */
    public static async restart(
        id: string
    ): Promise<void> {

        await ModuleLoader.reload(
            this.requireDescriptor(id)
        );

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
     * Get every descriptor.
     */
    public static getAll(): readonly ModuleDescriptor[] {

        return ModuleRegistry.getAll();

    }

    /**
     * Module exists?
     */
    public static has(
        id: string
    ): boolean {

        return ModuleRegistry.has(id);

    }

    /**
     * Registered module count.
     */
    public static count(): number {

        return ModuleRegistry.count();

    }

    /**
     * Internal helper.
     */
    private static requireDescriptor(
        id: string
    ): ModuleDescriptor {

        const descriptor = ModuleRegistry.get(id);

        if (!descriptor) {
            throw new Error(
                `Module '${id}' is not registered.`
            );
        }

        return descriptor;

    }

}