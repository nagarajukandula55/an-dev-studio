import { BaseEvent } from "./Event";
import { EventKey } from "./EventPipeline";
import { EventMap } from "./EventMap";

/**
 * ============================================================================
 * AN Dev Studio
 * Event Builder
 * ============================================================================
 */

export class EventBuilder {

    public static create<K extends EventKey>(
        type: K,
        payload: EventMap[K],
        source = "system"
    ): BaseEvent<K, EventMap[K]> {

        return {

            id: crypto.randomUUID(),

            type,

            payload,

            timestamp: Date.now(),

            source,

        };

    }

}