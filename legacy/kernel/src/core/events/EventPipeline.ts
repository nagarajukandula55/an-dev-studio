import { BaseEvent } from "./Event";
import { EventMap } from "./EventMap";

/**
 * ============================================================================
 * AN Dev Studio
 * Event Pipeline
 * ============================================================================
 */

export type EventKey = keyof EventMap;

/**
 * Strongly typed framework event.
 */
export type TypedEvent<
  K extends EventKey = EventKey
> = BaseEvent<K, EventMap[K]>;

/**
 * Event execution context.
 */
export interface EventContext<
  K extends EventKey = EventKey
> {

  /**
   * Event being processed.
   */
  event: TypedEvent<K>;

  /**
   * Convenience alias for event.payload.
   */
  payload: EventMap[K];

  /**
   * Stop propagation.
   */
  cancelled: boolean;

  /**
   * Pipeline metadata.
   */
  metadata: Record<string, unknown>;

}
