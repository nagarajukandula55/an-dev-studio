/**
 * ============================================================================
 * AN Dev Studio
 * Event Handler
 * ============================================================================
 *
 * Strongly typed event handler.
 *
 * The payload type is inferred automatically from EventMap.
 * ============================================================================
 */

import { BaseEvent } from "./Event";
import { EventMap } from "./EventMap";

/**
 * Event handler.
 */
export type EventHandler<
  TEvent extends keyof EventMap = keyof EventMap
> = (
  event: BaseEvent<TEvent, EventMap[TEvent]>
) => void | Promise<void>;