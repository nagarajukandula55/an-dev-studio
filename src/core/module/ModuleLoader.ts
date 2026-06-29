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
 * Responsibilities
 *
 * • Initialize modules
 * • Dispose modules
 * • Reload modules
 * • Bulk initialization
 * • Bulk disposal
 *
 * ============================================================================
 */

export class ModuleLoader {

    /**
     * Initialize one module.
     */
    public static async initialize(
        descriptor: ModuleDescriptor
    ): Promise<void> {

        if (
            descriptor.state === ModuleState.RUNNING ||
            descriptor.state === ModuleState.INITIALIZING
        ) {
            return;
        }

        try {

            ModuleRegistry.setState(
                descriptor.module.id,
                ModuleState.INITIALIZING
            );

            const start = Date.now();

            await descriptor.module.initialize();

            descriptor.startupTime = Date.now() - start;
            descriptor.initializedAt = new Date();
            descriptor.error = undefined;

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
     * Initialize multiple modules.
     *
     * Modules are initialized sequentially
     * to preserve dependency order.
     */
    public static async initializeMany(
        descriptors: readonly ModuleDescriptor[]
    ): Promise<void> {

        for (const descriptor of descriptors) {
            await this.initialize(descriptor);
        }

    }

    /**
     * Dispose one module.
     */
    public static async dispose(
        descriptor: ModuleDescriptor
    ): Promise<void> {

        if (
            descriptor.state === ModuleState.STOPPED ||
            descriptor.state === ModuleState.STOPPING
        ) {
            return;
        }

        try {

            ModuleRegistry.setState(
                descriptor.module.id,
                ModuleState.STOPPING
            );

            if (descriptor.module.dispose) {
                await descriptor.module.dispose();
            }

            descriptor.disposedAt = new Date();
            descriptor.error = undefined;

            ModuleRegistry.setState(
                descriptor.module.id,
                ModuleState.STOPPED
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
     * Dispose multiple modules.
     *
     * Reverse order protects dependency chain.
     */
    public static async disposeMany(
        descriptors: readonly ModuleDescriptor[]
    ): Promise<void> {

        const reversed = [...descriptors].reverse();

        for (const descriptor of reversed) {
            await this.dispose(descriptor);
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