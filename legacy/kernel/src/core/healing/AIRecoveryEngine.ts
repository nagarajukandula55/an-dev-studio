import { AIRecoveryDecision } from "./AIRecoveryTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Recovery Engine (v2 - Reasoning Layer)
 * ============================================================================
 */

export class AIRecoveryEngine {

  /**
   * Analyze failure and decide recovery strategy
   */
  public static async analyze(
    eventType: string,
    error: unknown
  ): Promise<AIRecoveryDecision> {

    const message = error instanceof Error ? error.message : String(error);

    /**
     * RULE 1: transient errors → retry
     */
    if (message.includes("timeout") || message.includes("ECONNRESET")) {
      return {
        action: "RETRY",
        reason: "Transient network/system failure detected",
        confidence: 0.85,
      };
    }

    /**
     * RULE 2: undefined payload → rewrite
     */
    if (message.includes("undefined") || message.includes("payload")) {
      return {
        action: "REWRITE_PAYLOAD",
        reason: "Missing or malformed event payload",
        confidence: 0.9,
      };
    }

    /**
     * RULE 3: repeated failures → isolate
     */
    if (message.includes("max") || message.includes("stack")) {
      return {
        action: "ISOLATE_HANDLER",
        reason: "Possible infinite loop or recursion detected",
        confidence: 0.92,
      };
    }

    /**
     * DEFAULT: escalate
     */
    return {
      action: "ESCALATE_AI",
      reason: "Unknown failure pattern",
      confidence: 0.6,
    };
  }
}