/**
 * ============================================================================
 * AN Dev Studio
 * Config Validator
 * ============================================================================
 */

import { ConfigManager } from "./ConfigManager";

export class ConfigValidator {

    /**
     * Ensure required keys exist.
     */
    public static require(
        ...keys: string[]
    ): void {

        for (const key of keys) {

            if (!ConfigManager.has(key)) {

                throw new Error(
                    `Missing configuration '${key}'.`
                );

            }

        }

    }

    /**
     * Verify framework configuration.
     */
    public static validate(): void {

        // Reserved for future schema validation.

    }

}