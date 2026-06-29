/**
 * ============================================================================
 * AN Dev Studio
 * Configuration Loader
 * ============================================================================
 *
 * Loads configuration from registered providers.
 *
 * Responsibilities
 *
 * • Register providers
 * • Load configuration
 * • Reset providers
 * • Runtime provider discovery
 *
 * ============================================================================
 */

import { ConfigManager } from "./ConfigManager";
import { ConfigProvider } from "./ConfigProvider";

export class ConfigLoader {

    /**
     * Registered providers.
     */
    private static readonly registeredProviders: ConfigProvider[] = [];

    /**
     * Register provider.
     */
    public static register(
        provider: ConfigProvider
    ): void {

        this.registeredProviders.push(provider);

    }

    /**
     * Register multiple providers.
     */
    public static registerMany(
        providers: readonly ConfigProvider[]
    ): void {

        for (const provider of providers) {
            this.register(provider);
        }

    }

    /**
     * Load every provider.
     */
    public static async load(): Promise<void> {

        for (const provider of this.registeredProviders) {

            const values = await provider.load();

            for (const [key, value] of Object.entries(values)) {

                ConfigManager.set(
                    key,
                    value
                );

            }

        }

    }

    /**
     * Get all providers.
     */
    public static getProviders(): readonly ConfigProvider[] {

        return Object.freeze([
            ...this.registeredProviders
        ]);

    }

    /**
     * Number of providers.
     */
    public static count(): number {

        return this.registeredProviders.length;

    }

    /**
     * Remove all providers.
     *
     * Used by tests and runtime reset.
     */
    public static clear(): void {

        this.registeredProviders.length = 0;

    }

}