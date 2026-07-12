import { EventHistory } from "./EventHistory";
import { EventStatistics, EventStatistic } from "./EventStatistics";
import { EventBus } from "./EventBus";

/**
 * ============================================================================
 * AN Dev Studio
 * Event Diagnostics
 * ============================================================================
 */

export interface EventHealthReport {

    totalEvents: number;

    totalListeners: number;

    registeredEvents: number;

    successfulEvents: number;

    failedEvents: number;

    successRate: number;

    health: "HEALTHY" | "WARNING" | "CRITICAL";

    timestamp: Date;

    statistics: Record<string, EventStatistic>;

}

export class EventDiagnostics {

    public static report(): EventHealthReport {

        const stats = EventStatistics.getAll();

        const statistics: Record<string, EventStatistic> = {};

        let successfulEvents = 0;

        let failedEvents = 0;

        for (const [event, value] of stats.entries()) {

            statistics[event] = {

                emitted: value.emitted,

                handled: value.handled,

                failed: value.failed,

            };

            successfulEvents += value.handled;

            failedEvents += value.failed;

        }

        const totalEvents = EventHistory.count();

        const totalListeners = EventBus.totalListeners();

        const registeredEvents =
            EventBus.registeredEvents().length;

        const totalProcessed =
            successfulEvents + failedEvents;

        const successRate =
            totalProcessed === 0
                ? 100
                : (successfulEvents / totalProcessed) * 100;

        let health: EventHealthReport["health"] = "HEALTHY";

        if (successRate < 95) {

            health = "WARNING";

        }

        if (successRate < 80) {

            health = "CRITICAL";

        }

        return {

            totalEvents,

            totalListeners,

            registeredEvents,

            successfulEvents,

            failedEvents,

            successRate,

            health,

            timestamp: new Date(),

            statistics,

        };

    }

    public static print(): void {

        console.table(this.report());

    }

}