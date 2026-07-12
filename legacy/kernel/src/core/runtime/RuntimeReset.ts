/**
 * ============================================================================
 * AN Dev Studio
 * Runtime Reset
 * ============================================================================
 *
 * Responsible for restoring the framework to a clean state.
 *
 * Every subsystem reset MUST happen here.
 *
 * ============================================================================
 */

import { Runtime } from "./Runtime";

import { ServiceBootstrap } from "../container/bootstrap";
import { ServiceContainer } from "../container/ServiceContainer";

import { ModuleRegistry } from "../module/ModuleRegistry";

import { EventHistory } from "../events/EventHistory";
import { EventStatistics } from "../events/EventStatistics";

export class RuntimeReset {

    /**
     * Reset complete runtime.
     */
    public static async reset(): Promise<void> {

        /**
         * Dispose all singleton services.
         */
        await ServiceContainer.dispose();

        /**
         * Allow framework bootstrap again.
         */
        ServiceBootstrap.reset();

        /**
         * Remove runtime module registrations.
         */
        ModuleRegistry.clear();

        /**
         * Clear event history.
         */
        if ("clear" in EventHistory) {
            (EventHistory as typeof EventHistory & {
                clear(): void;
            }).clear();
        }

        /**
         * Reset event statistics.
         */
        if ("clear" in EventStatistics) {
            (EventStatistics as typeof EventStatistics & {
                clear(): void;
            }).clear();
        }

        /**
         * Reset runtime.
         */
        Runtime.reset();

    }

}