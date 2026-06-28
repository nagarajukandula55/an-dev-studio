import { AIEventInspector, AIInspectionResult } from "./AIEventInspector";
import { EventContext, EventKey } from "./EventPipeline";

export class DefaultAIInspector implements AIEventInspector {
  async inspect<K extends EventKey>(
    ctx: EventContext<K>
  ): Promise<AIInspectionResult<K>> {

    // basic safety rule example
    if (ctx.event.type === "system.boot" && !ctx.event.payload) {
      return {
        allow: false,
        reason: "Invalid system boot payload",
        confidence: 0.9,
      };
    }

    ctx.metadata = {
      ...ctx.metadata,
      stage: "ai-processed",
    };

    return {
      allow: true,
      modifiedEvent: ctx,
      confidence: 1,
    };
  }
}