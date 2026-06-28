import { BaseEvent } from "./Event";

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
  public static create<TPayload>(
    type: string,
    payload: TPayload,
    source?: string
  ): BaseEvent<string, TPayload> {
    return {
      type,
      payload,
      source,
      timestamp: Date.now(),
    };
  }
}