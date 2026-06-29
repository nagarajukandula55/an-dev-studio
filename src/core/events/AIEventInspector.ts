import { EventContext } from "./EventPipeline";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Event Inspector
 * ============================================================================
 */

export interface AIInspectionResult {

    /**
     * Allow event execution.
     */
    allow: boolean;

    /**
     * Confidence score (0-1)
     */
    confidence: number;

    /**
     * Optional reason if blocked.
     */
    reason?: string;

    /**
     * AI may modify the event/context.
     */
    modifiedEvent?: EventContext<any>;

}

/**
 * ============================================================================
 * Contract implemented by all AI inspectors.
 * ============================================================================
 */
export interface AIEventInspector {

    inspect(
        context: EventContext<any>
    ): Promise<AIInspectionResult>;

}