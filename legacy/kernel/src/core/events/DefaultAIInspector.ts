import {
    AIEventInspector,
    AIInspectionResult,
} from "./AIEventInspector";

import {
    EventContext,
    EventKey,
} from "./EventPipeline";

/**
 * ============================================================================
 * AN Dev Studio
 * Default AI Event Inspector
 * ============================================================================
 *
 * Default implementation.
 *
 * Future versions will be replaced by
 * Local LLM / Cloud AI Runtime.
 * ============================================================================
 */

export class DefaultAIInspector implements AIEventInspector {

    public async inspect<K extends EventKey>(
        context: EventContext<K>
    ): Promise<AIInspectionResult> {

        /**
         * ------------------------------------------------------------
         * Basic Validation
         * ------------------------------------------------------------
         */

        if (!context.event.type) {

            return {

                allow: false,

                confidence: 1,

                reason: "Missing event type",

            };

        }

        if (!context.event.timestamp) {

            return {

                allow: false,

                confidence: 1,

                reason: "Missing timestamp",

            };

        }

        /**
         * ------------------------------------------------------------
         * Initialize Metadata
         * ------------------------------------------------------------
         */

        context.metadata = {

            ...context.metadata,

            inspected: true,

            inspectedAt: Date.now(),

            inspector: "DefaultAIInspector",

            aiVersion: "1.0.0",

        };

        /**
         * ------------------------------------------------------------
         * Example Rule
         * ------------------------------------------------------------
         *
         * Future:
         *  - Detect spam events
         *  - Detect recursive loops
         *  - Detect malformed payloads
         *  - Detect security issues
         *  - Predict failures
         *
         */

        if (
            context.event.type === "system.boot" &&
            !context.event.payload
        ) {

            return {

                allow: false,

                confidence: 0.98,

                reason: "Invalid boot payload",

            };

        }

        /**
         * ------------------------------------------------------------
         * Approved
         * ------------------------------------------------------------
         */

        return {

            allow: true,

            confidence: 1,

            modifiedEvent: context,

        };

    }

}