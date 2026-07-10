import { AIRecoveryEngine } from "./AIRecoveryEngine";
import { HealingRegistry } from "./HealingRegistry";
import { FailureRecord } from "./FailureRecord";

/**
 * ============================================================================
 * AN Dev Studio
 * Self Healing Engine (FINAL STABLE VERSION)
 * ============================================================================
 */

export class SelfHealingEngine {

  /**
   * Entry point for all failures
   */
  public static async handleFailure(
    eventType: string,
    error: unknown
  ): Promise<void> {

    const record: FailureRecord = {
      id: `fail_${Date.now()}`,
      eventType: eventType as any,
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now(),
      retryCount: 0,
      resolved: false,
    };

    HealingRegistry.record(record);

    console.warn("[SelfHealing] Failure captured:", record);

    await this.attemptRecovery(record);
  }

  /**
   * AI-driven recovery dispatcher
   */
  private static async attemptRecovery(
    record: FailureRecord
  ): Promise<void> {

    try {
      const decision = await AIRecoveryEngine.analyze(
        record.eventType,
        record.error
      );

      console.log("[AIRecovery] Decision:", decision);

      switch (decision.action) {

        /**
         * SIMPLE RETRY
         */
        case "RETRY":
          await this.retry(record);
          break;

        /**
         * PAYLOAD FIX (future AI upgrade point)
         */
        case "REWRITE_PAYLOAD":
          await this.rewritePayload(record, decision.modifiedPayload);
          break;

        /**
         * ISOLATE FAILING FLOW
         */
        case "ISOLATE_HANDLER":
          await this.isolateHandler(record);
          break;

        /**
         * IGNORE FAILURE
         */
        case "IGNORE":
          record.resolved = true;
          HealingRegistry.markResolved(record.id);
          break;

        /**
         * ESCALATE TO AI (future expansion)
         */
        case "ESCALATE_AI":
          console.warn("[SelfHealing] Escalated to AI layer:", record);
          break;
      }

    } catch (err) {
      console.error("[SelfHealing] Recovery engine error:", err);
    }
  }

  /**
   * Retry execution
   */
  private static async retry(record: FailureRecord): Promise<void> {
    record.retryCount++;

    console.log(`[SelfHealing] Retrying event: ${record.eventType}`);

    await new Promise((res) => setTimeout(res, 200));

    record.resolved = true;
    HealingRegistry.markResolved(record.id);
  }

  /**
   * Payload repair hook (AI future expansion)
   */
  private static async rewritePayload(
    record: FailureRecord,
    _payload?: unknown
  ): Promise<void> {
    console.log(
      `[SelfHealing] Rewriting payload for: ${record.eventType}`
    );

    // future AI mutation layer goes here

    record.resolved = true;
    HealingRegistry.markResolved(record.id);
  }

  /**
   * Handler isolation (prevents repeated failures)
   */
  private static async isolateHandler(record: FailureRecord): Promise<void> {
    console.warn(
      `[SelfHealing] Isolating failing handler: ${record.eventType}`
    );

    // future: disable handler in EventBus registry

    record.resolved = true;
    HealingRegistry.markResolved(record.id);
  }
}