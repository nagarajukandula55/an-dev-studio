/**
 * ============================================================================
 * AN Dev Studio
 * Event System - Base Event
 * ============================================================================
 *
 * Base contract for every event flowing through the framework.
 *
 * Events are immutable.
 * ============================================================================
 */

export interface BaseEvent<
  TType extends string = string,
  TPayload = unknown
> {

  /**
   * Unique event id.
   */
  readonly id: string;

  /**
   * Event type.
   */
  readonly type: TType;

  /**
   * Creation timestamp.
   */
  readonly timestamp: number;

  /**
   * Event payload.
   */
  readonly payload: TPayload;

  /**
   * Event source.
   */
  readonly source?: string;

  /**
   * Correlation id used to connect
   * multiple events within one workflow.
   */
  readonly correlationId?: string;

  /**
   * Optional metadata.
   */
  readonly metadata?: Record<string, unknown>;

}