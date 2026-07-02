import { BaseEvent } from "./Event";
import { EventMap } from "./EventMap";

/**
 * ============================================================================
 * AN Dev Studio
 * Event Factory
 * ============================================================================
 *
 * Standardized way to create events.
 * Ensures consistent structure across the system.
 */

export class EventFactory {
  public static create<K extends keyof EventMap>(
    type: K,
    payload: EventMap[K],
    source?: string
  ): BaseEvent<K, EventMap[K]> {
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      payload,
      source,
      timestamp: Date.now(),
    };
  }
}
