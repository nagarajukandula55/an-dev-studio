import { DefaultAIInspector } from "./DefaultAIInspector";
import { EventHandler } from "./EventHandler";
import {
  EventContext,
  EventKey,
  TypedEvent,
} from "./EventPipeline";
import { EventMap } from "./EventMap";
import { SelfHealingEngine } from "../healing/SelfHealingEngine";

/**
 * ============================================================================
 * AN Dev Studio
 * Enterprise Event Bus
 * ============================================================================
 *
 * Responsibilities
 *
 * • Subscribe
 * • Unsubscribe
 * • Subscribe Once
 * • Emit
 * • AI Inspection
 * • Self Healing
 * • Wildcard Listeners
 * • Diagnostics
 *
 * ============================================================================
 */

export class EventBus {

  /**
   * Event listeners
   */
  private static readonly handlers =
    new Map<EventKey, Set<EventHandler<any>>>();

  /**
   * Global listeners (*)
   */
  private static readonly wildcardHandlers =
    new Set<(ctx: EventContext<any>) => void | Promise<void>>();

  /**
   * AI Inspector
   */
  private static readonly inspector =
    new DefaultAIInspector();

  /**
   * ============================================================
   * Subscribe
   * ============================================================
   */

  public static on<K extends EventKey>(
    event: K,
    handler: EventHandler<K>
  ): void {

    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event)!.add(handler);

  }

  /**
   * ============================================================
   * Subscribe Once
   * ============================================================
   */

  public static once<K extends EventKey>(
    event: K,
    handler: EventHandler<K>
  ): void {

    const wrapper: EventHandler<K> = async (e) => {

      this.off(event, wrapper);

      await handler(e);

    };

    this.on(event, wrapper);

  }

  /**
   * ============================================================
   * Global Listener
   * ============================================================
   */

  public static onAny(
    handler: (ctx: EventContext<any>) => void | Promise<void>
  ): void {

    this.wildcardHandlers.add(handler);

  }

  /**
   * ============================================================
   * Remove Listener
   * ============================================================
   */

  public static off<K extends EventKey>(
    event: K,
    handler: EventHandler<K>
  ): void {

    const set = this.handlers.get(event);

    if (!set) return;

    set.delete(handler);

    if (set.size === 0) {
      this.handlers.delete(event);
    }

  }

  /**
   * ============================================================
   * Emit
   * ============================================================
   */

  public static async emit<K extends EventKey>(
    event: TypedEvent<K>
  ): Promise<void> {

    const ctx: EventContext<K> = {

      event,

      cancelled: false,

      metadata: {},

    };

    /**
     * AI Inspection
     */

    await this.preProcess(ctx);

    if (ctx.cancelled) {

      return;

    }

    /**
     * Wildcard listeners
     */

    for (const listener of this.wildcardHandlers) {

      try {

        await listener(ctx);

      } catch (err) {

        await SelfHealingEngine.handleFailure(
          event.type,
          err
        );

      }

    }

    /**
     * Typed listeners
     */

    const listeners = this.handlers.get(event.type);

    if (listeners) {

      for (const handler of listeners) {

        try {

          await handler(ctx.event);

        }

        catch (err) {

          await SelfHealingEngine.handleFailure(

            event.type,

            err

          );

        }

      }

    }

    /**
     * AI Post Processing
     */

    await this.postProcess(ctx);

  }

  /**
   * ============================================================
   * AI Pre Processing
   * ============================================================
   */

  private static async preProcess<K extends EventKey>(
    ctx: EventContext<K>
  ): Promise<void> {

    const result =
      await this.inspector.inspect(ctx);

    if (!result.allow) {

      ctx.cancelled = true;

      return;

    }

    if (result.modifiedEvent) {

      ctx.event =
        result.modifiedEvent.event as TypedEvent<K>;

      ctx.metadata = {

        ...ctx.metadata,

        ...result.modifiedEvent.metadata,

      };

    }

    ctx.metadata = {

      ...ctx.metadata,

      aiApproved: true,

      confidence: result.confidence,

    };

  }

  /**
   * ============================================================
   * AI Post Processing
   * ============================================================
   */

  private static async postProcess<K extends EventKey>(
    ctx: EventContext<K>
  ): Promise<void> {

    console.log(

      `[EventBus] ${ctx.event.type}`,

      ctx.metadata

    );

  }

  /**
   * ============================================================
   * Diagnostics
   * ============================================================
   */

  public static listenerCount(
    event: EventKey
  ): number {

    return this.handlers.get(event)?.size ?? 0;

  }

  public static eventTypes(): readonly EventKey[] {

    return Object.freeze(

      [...this.handlers.keys()]

    );

  }

  public static clear(): void {

    this.handlers.clear();

    this.wildcardHandlers.clear();

  }

}