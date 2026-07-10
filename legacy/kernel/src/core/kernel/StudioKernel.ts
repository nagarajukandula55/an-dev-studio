/**
 * ============================================================================
 * AN Dev Studio
 * Studio Kernel
 * ============================================================================
 *
 * Central runtime orchestrator.
 *
 * Responsible for:
 *
 * • Booting framework
 * • Initializing services
 * • Starting modules
 * • Runtime lifecycle
 * • Shutdown
 * • Restart
 * • Diagnostics
 *
 * ============================================================================
 */

import { BootReport } from "./BootReport";
import { KernelState } from "./KernelState";

import { ServiceBootstrap } from "../container/bootstrap";
import { ServiceContainer } from "../container/ServiceContainer";
import { ServiceTokens } from "../container/ServiceTokens";

import { ModuleManager } from "../module/ModuleManager";
import { ModuleRegistry } from "../module/ModuleRegistry";

import {
    EventBus,
    EventBuilder,
    EventDiagnostics
} from "../events";
import { RuntimeReset } from "../runtime/RuntimeReset";

export class StudioKernel {

    /**
     * ============================================================
     * Runtime State
     * ============================================================
     */

    private static state: KernelState =
        KernelState.CREATED;

    private static booting = false;

    private static bootPromise:
        Promise<BootReport> | null = null;

    private static report: BootReport = {

        framework: "AN Dev Studio",

        version: "1.0.0",

        startedAt: new Date(),

        state: KernelState.CREATED,

        modulesLoaded: 0,

        servicesLoaded: 0,

        healthyModules: 0,

        failedModules: 0,

        warnings: [],

        success: false,

    };

    /**
     * Boot entry point.
     */

    public static async boot(): Promise<BootReport> {

        if (this.state === KernelState.RUNNING) {

            return this.report;

        }

        if (this.booting && this.bootPromise) {

            return this.bootPromise;

        }

        this.booting = true;

        this.bootPromise = this.internalBoot();

        return this.bootPromise;

    }

        /**
     * ============================================================
     * Internal Boot Sequence
     * ============================================================
     */

    private static async internalBoot(): Promise<BootReport> {

        const start = performance.now();

        this.state = KernelState.BOOTING;

        this.report = {

            framework: "AN Dev Studio",

            version: "1.0.0",

            startedAt: new Date(),

            state: KernelState.BOOTING,

            modulesLoaded: 0,

            servicesLoaded: 0,

            healthyModules: 0,

            failedModules: 0,

            warnings: [],

            success: false,

        };

        try {

            console.log("");
            console.log("==================================================");
            console.log("AN DEV STUDIO KERNEL");
            console.log("==================================================");
            console.log("");

            /**
             * --------------------------------------------------------
             * Phase 1
             * Register framework services
             * --------------------------------------------------------
             */

            console.log("[Kernel] Registering services...");

            ServiceBootstrap.initialize();

            ServiceContainer.validate();

            this.report.servicesLoaded =
                ServiceContainer.count();

            /**
             * --------------------------------------------------------
             * Phase 2
             * Resolve core services
             * --------------------------------------------------------
             */

            console.log("[Kernel] Resolving services...");

            await ServiceContainer.resolve(
                ServiceTokens.EVENT_BUS
            );

            await ServiceContainer.resolve(
                ServiceTokens.MODULE_MANAGER
            );

            await ServiceContainer.resolve(
                ServiceTokens.MODULE_REGISTRY
            );

            await ServiceContainer.resolve(
                ServiceTokens.MODULE_LOADER
            );

            /**
             * --------------------------------------------------------
             * Phase 3
             * Initialize registered modules
             * --------------------------------------------------------
             */

            console.log("[Kernel] Initializing modules...");

            await ModuleManager.initializeAll();

            this.report.modulesLoaded =
                ModuleRegistry.count();

            const summary =
                ModuleRegistry.healthSummary();

            this.report.healthyModules =
                summary.healthy;

            this.report.failedModules =
                summary.failed;

            /**
             * --------------------------------------------------------
             * Phase 4
             * Publish boot event
             * --------------------------------------------------------
             */

            console.log("[Kernel] Publishing boot event...");

            await EventBus.emit(

                EventBuilder.create(

                    "system.boot",

                    {
                        time: Date.now(),
                    },

                    "StudioKernel"

                )

            );

                        /**
             * --------------------------------------------------------
             * Phase 5
             * Diagnostics
             * --------------------------------------------------------
             */

            console.log("[Kernel] Running diagnostics...");

            const diagnostics =
                EventDiagnostics.report();

            if (diagnostics.failedEvents > 0) {

                this.report.warnings.push(
                    `${diagnostics.failedEvents} event failures detected.`
                );

            }

            /**
             * --------------------------------------------------------
             * Boot Complete
             * --------------------------------------------------------
             */

            this.state = KernelState.RUNNING;

            this.booting = false;

            this.report.state = KernelState.RUNNING;

            this.report.completedAt = new Date();

            this.report.bootTime =
                Math.round(performance.now() - start);

            this.report.success = true;

            console.log("");
            console.log("==================================================");
            console.log("AN DEV STUDIO STARTED");
            console.log("==================================================");
            console.log("");

            console.table({

                Services: this.report.servicesLoaded,

                Modules: this.report.modulesLoaded,

                HealthyModules: this.report.healthyModules,

                FailedModules: this.report.failedModules,

                BootTime: `${this.report.bootTime} ms`,

                State: this.report.state,

            });

            return this.report;

        }
        catch (error) {

            this.booting = false;

            this.state = KernelState.FAILED;

            this.report.state = KernelState.FAILED;

            this.report.success = false;

            this.report.completedAt = new Date();

            this.report.bootTime =
                Math.round(performance.now() - start);

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            this.report.warnings.push(message);

            console.error("");
            console.error("==================================================");
            console.error("AN DEV STUDIO BOOT FAILED");
            console.error("==================================================");
            console.error(message);

            throw error;

        }

    }
        /**
     * ============================================================
     * Shutdown Framework
     * ============================================================
     */

    public static async shutdown(): Promise<void> {

        if (
            this.state === KernelState.STOPPED ||
            this.state === KernelState.STOPPING
        ) {
            return;
        }

        console.log("");
        console.log("==================================================");
        console.log("SHUTTING DOWN AN DEV STUDIO");
        console.log("==================================================");
        console.log("");

        this.state = KernelState.STOPPING;

        try {

            /**
             * --------------------------------------------------------
             * Dispose Modules
             * --------------------------------------------------------
             */

            console.log("[Kernel] Disposing modules...");

            await ModuleManager.disposeAll();

            /**
             * --------------------------------------------------------
             * Dispose Services
             * --------------------------------------------------------
             */

            console.log("[Kernel] Disposing services...");

            await RuntimeReset.reset();

            /**
             * --------------------------------------------------------
             * Reset Runtime
             * --------------------------------------------------------
             */

            this.state = KernelState.STOPPED;

            this.booting = false;

            this.bootPromise = null;

            console.log("");
            console.log("==================================================");
            console.log("KERNEL STOPPED");
            console.log("==================================================");
            console.log("");

        }
        catch (error) {

            this.state = KernelState.FAILED;

            console.error(
                "[Kernel] Shutdown failed:",
                error
            );

            throw error;

        }

    }

    /**
     * ============================================================
     * Restart Framework
     * ============================================================
     */

    public static async restart(): Promise<BootReport> {

        console.log("");
        console.log("[Kernel] Restart requested...");
        console.log("");

        await this.shutdown();

        return await this.boot();

    }

        /**
     * ============================================================
     * Runtime APIs
     * ============================================================
     */

    public static getState(): KernelState {

        return this.state;

    }

    public static isRunning(): boolean {

        return this.state === KernelState.RUNNING;

    }

    public static isBooting(): boolean {

        return this.state === KernelState.BOOTING;

    }

    public static getBootReport(): Readonly<BootReport> {

        return Object.freeze({

            ...this.report,

        });

    }

    public static diagnostics() {

        return {

            kernel: {

                state: this.state,

                booting: this.booting,

            },

            services: {

                registered: ServiceContainer.count(),

                tokens: ServiceContainer.getAll(),

            },

            modules: ModuleRegistry.healthSummary(),

            events: EventDiagnostics.report(),

        };

    }

    /**
     * ============================================================
     * Runtime Summary
     * ============================================================
     */

    public static summary() {

        return {

            framework: this.report.framework,

            version: this.report.version,

            state: this.state,

            services: ServiceContainer.count(),

            modules: ModuleRegistry.count(),

            runningModules:
                ModuleRegistry.getRunning().length,

            uptimeStarted:
                this.report.startedAt,

            success:
                this.report.success,

        };

    }

}