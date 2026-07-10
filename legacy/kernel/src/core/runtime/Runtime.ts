/**
 * ============================================================================
 * AN Dev Studio
 * Runtime
 * ============================================================================
 *
 * Central runtime facade.
 *
 * Every subsystem reports through Runtime.
 *
 * ============================================================================
 */

import { ServiceContainer } from "../container/ServiceContainer";
import { ModuleRegistry } from "../module/ModuleRegistry";
import { KernelState } from "../kernel/KernelState";
import { EventDiagnostics } from "../events";

import { RuntimeSnapshot } from "./RuntimeSnapshot";

export class Runtime {

    private static startedAt?: Date;

    private static kernelState: KernelState = KernelState.CREATED;

    private static booting = false;

    /**
     * Called by Kernel.
     */
    public static setKernelState(
        state: KernelState
    ): void {

        this.kernelState = state;

        if (
            state === KernelState.RUNNING &&
            !this.startedAt
        ) {
            this.startedAt = new Date();
        }

    }

    /**
     * Called by Kernel.
     */
    public static setBooting(
        value: boolean
    ): void {

        this.booting = value;

    }

    /**
     * Reset runtime state.
     *
     * Invoked only by RuntimeReset.
     */
    public static reset(): void {

        this.startedAt = undefined;

        this.booting = false;

        this.kernelState = KernelState.CREATED;

    }

    /**
     * Current kernel state.
     */
    public static state(): KernelState {

        return this.kernelState;

    }

    /**
     * Framework uptime.
     */
    public static uptime(): number {

        if (!this.startedAt) {
            return 0;
        }

        return Date.now() - this.startedAt.getTime();

    }

    /**
     * Runtime snapshot.
     */
    public static snapshot(): RuntimeSnapshot {

        return {

            framework: "AN Dev Studio",

            version: "1.0.0",

            kernel: {

                state: this.kernelState,

                booting: this.booting,

            },

            services: {

                registered: ServiceContainer.count(),

            },

            modules: ModuleRegistry.healthSummary(),

            events: EventDiagnostics.report(),

            uptime: {

                startedAt: this.startedAt,

                milliseconds: this.uptime(),

            },

        };

    }

}