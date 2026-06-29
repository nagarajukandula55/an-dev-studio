/**
 * ============================================================================
 * AN Dev Studio
 * Event System Runtime Test
 * ============================================================================
 */

import { EventBus } from "./EventBus";
import { EventHistory } from "./EventHistory";
import { EventStatistics } from "./EventStatistics";
import { EventDiagnostics } from "./EventDiagnostics";

import { TypedEvent } from "./EventPipeline";

export class EventTests {

    public static async run(): Promise<void> {

        console.log("");
        console.log("======================================");
        console.log("EVENT SYSTEM TEST");
        console.log("======================================");

        EventBus.clear();

        let executed = false;

        /**
         * ------------------------------------------------------------
         * Register Handler
         * ------------------------------------------------------------
         */

        EventBus.on(
            "system.boot",
            async () => {

                executed = true;

            }
        );

        console.log("Register Handler: PASS");

        /**
         * ------------------------------------------------------------
         * Emit Event
         * ------------------------------------------------------------
         */

        const event: TypedEvent<"system.boot"> = {

            id: crypto.randomUUID(),

            type: "system.boot",

            payload: {

                time: Date.now(),

            },

            timestamp: Date.now(),

            source: "EventTests",

        };

        await EventBus.emit(event);

        console.log(
            "Emit:",
            executed ? "PASS" : "FAIL"
        );

        /**
         * ------------------------------------------------------------
         * History
         * ------------------------------------------------------------
         */

        console.log(
            "History:",
            EventHistory.count() === 1
                ? "PASS"
                : "FAIL"
        );

        /**
         * ------------------------------------------------------------
         * Statistics
         * ------------------------------------------------------------
         */

        const stats =
            EventStatistics.get("system.boot");

        console.log(
            "Statistics:",
            stats.emitted === 1 &&
            stats.handled === 1
                ? "PASS"
                : "FAIL"
        );

        /**
         * ------------------------------------------------------------
         * Listener Count
         * ------------------------------------------------------------
         */

        console.log(
            "Listeners:",
            EventBus.listenerCount("system.boot") === 1
                ? "PASS"
                : "FAIL"
        );

        /**
         * ------------------------------------------------------------
         * Diagnostics
         * ------------------------------------------------------------
         */

        const report =
            EventDiagnostics.report();

        console.log(
            "Diagnostics:",
            report.health === "HEALTHY"
                ? "PASS"
                : "FAIL"
        );

        console.log("");
        console.table(report);

        console.log("");
        console.log("======================================");
        console.log("EVENT SYSTEM TEST COMPLETE");
        console.log("======================================");
        console.log("");

    }

}