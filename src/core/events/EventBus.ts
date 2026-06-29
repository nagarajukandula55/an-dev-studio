import { EventContext, EventKey, TypedEvent } from "./EventPipeline";
import { DefaultAIInspector } from "./DefaultAIInspector";
import { EventHistory } from "./EventHistory";
import { EventStatistics } from "./EventStatistics";
import { SelfHealingEngine } from "../healing/SelfHealingEngine";

type Handler<K extends EventKey = EventKey> =
  (context: EventContext<K>) => void | Promise<void>;

/**
 * ============================================================================
 * AN Dev Studio
 * Enterprise Event Bus
 * ============================================================================
 */

export class EventBus {

    private static readonly handlers =
        new Map<EventKey, Set<Handler>>();

    private static readonly inspector =
        new DefaultAIInspector();

    /**
     * =========================================================================
     * Subscribe
     * =========================================================================
     */

    public static on<K extends EventKey>(
        event: K,
        handler: Handler<K>
    ): void {

        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }

        this.handlers.get(event)!.add(handler as Handler);

    }

    /**
     * =========================================================================
     * Unsubscribe
     * =========================================================================
     */

    public static off<K extends EventKey>(
        event: K,
        handler: Handler<K>
    ): void {

        this.handlers.get(event)?.delete(handler as Handler);

    }

    /**
     * =========================================================================
     * Emit
     * =========================================================================
     */

    public static async emit<K extends EventKey>(
        event: TypedEvent<K>
    ): Promise<void> {

        EventHistory.push(event);

        EventStatistics.emitted(event.type);

        const context: EventContext<K> = {

            event,

            cancelled: false,

            metadata: {},

        };

        const inspection =
            await this.inspector.inspect(context);

        if (!inspection.allow) {

            return;

        }

        const handlers =
            this.handlers.get(event.type);

        if (!handlers || handlers.size === 0) {

            return;

        }

        for (const handler of handlers) {

            try {

                await handler(context);

                EventStatistics.handled(event.type);

            }

            catch (error) {

                EventStatistics.failed(event.type);

                await SelfHealingEngine.handleFailure(

                    event.type,

                    error

                );

            }

        }

    }

    /**
     * =========================================================================
     * Emit Sync
     * =========================================================================
     */

    public static emitSync<K extends EventKey>(
        event: TypedEvent<K>
    ): void {

        EventHistory.push(event);

        EventStatistics.emitted(event.type);

        const handlers =
            this.handlers.get(event.type);

        if (!handlers) {

            return;

        }

        const context: EventContext<K> = {

            event,

            cancelled: false,

            metadata: {},

        };

        for (const handler of handlers) {

            try {

                handler(context);

                EventStatistics.handled(event.type);

            }

            catch {

                EventStatistics.failed(event.type);

            }

        }

    }

    /**
     * =========================================================================
     * Listener Count
     * =========================================================================
     */

    public static listenerCount(

        event: EventKey

    ): number {

        return this.handlers.get(event)?.size ?? 0;

    }

    /**
     * =========================================================================
     * Total Listeners
     * =========================================================================
     */

    public static totalListeners(): number {

        let total = 0;

        for (const set of this.handlers.values()) {

            total += set.size;

        }

        return total;

    }

    /**
     * =========================================================================
     * Registered Events
     * =========================================================================
     */

    public static registeredEvents(): readonly EventKey[] {

        return Object.freeze(

            [...this.handlers.keys()]

        );

    }

    /**
     * =========================================================================
     * Clear
     * =========================================================================
     */

    public static clear(): void {

        this.handlers.clear();

        EventHistory.clear();

        EventStatistics.clear();

    }

}