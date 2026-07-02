/**
 * ============================================================================
 * AN Dev Studio
 * Config Manager
 * ============================================================================
 */

import {
    ConfigEntry,
    ConfigSnapshot,
    ConfigValue
} from "./ConfigTypes";

export class ConfigManager {

    private static readonly values =
        new Map<string, ConfigEntry>();

    /**
     * Set value.
     */
    public static set<T extends ConfigValue>(
        key: string,
        value: T,
        description?: string,
        readonly = false
    ): void {

        const existing = this.values.get(key);

        if (existing?.readonly) {
            throw new Error(
                `'${key}' is readonly.`
            );
        }

        this.values.set(key, {

            key,

            value,

            description,

            readonly,

        });

    }

    /**
     * Get value.
     */
    public static get<T = ConfigValue>(
        key: string
    ): T {

        const config = this.values.get(key);

        if (!config) {
            throw new Error(
                `Configuration '${key}' not found.`
            );
        }

        return config.value as T;

    }

    /**
     * Exists?
     */
    public static has(
        key: string
    ): boolean {

        return this.values.has(key);

    }

    /**
     * Remove.
     */
    public static delete(
        key: string
    ): boolean {

        const config = this.values.get(key);

        if (config?.readonly) {

            throw new Error(
                `'${key}' is readonly.`
            );

        }

        return this.values.delete(key);

    }

    /**
     * Snapshot.
     */
    public static snapshot(): ConfigSnapshot {

        const values = [...this.values.values()];

        return {

            total: values.length,

            readonly: values.filter(
                c => c.readonly
            ).length,

            environment: "development",

            keys: values.map(
                c => c.key
            ),

        };

    }

    /**
     * Remove everything.
     */
    public static clear(): void {

        this.values.clear();

    }

}
