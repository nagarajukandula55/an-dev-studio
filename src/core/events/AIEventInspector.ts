import { EventMap } from "./EventMap";
import { EventContext, EventKey } from "./EventPipeline";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Event Inspector
 * ============================================================================
 */

export interface AIInspectionResult<K extends EventKey> {
  allow: boolean;
  modifiedEvent?: EventContext<K>;
  reason?: string;
  confidence?: number;
}

export interface AIEventInspector {
  inspect<K extends EventKey>(
    ctx: EventContext<K>
  ): Promise<AIInspectionResult<K>>;
}