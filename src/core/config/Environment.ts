/**
 * ============================================================================
 * AN Dev Studio
 * Environment
 * ============================================================================
 */

export type RuntimeEnvironment =
    | "development"
    | "testing"
    | "staging"
    | "production";

export class Environment {

    private static currentEnvironment: RuntimeEnvironment =
        "development";

    /**
     * Current environment.
     */
    public static current(): RuntimeEnvironment {

        return this.currentEnvironment;

    }

    /**
     * Set environment.
     *
     * Called during bootstrap.
     */
    public static set(
        environment: RuntimeEnvironment
    ): void {

        this.currentEnvironment = environment;

    }

    public static isDevelopment(): boolean {

        return this.currentEnvironment === "development";

    }

    public static isTesting(): boolean {

        return this.currentEnvironment === "testing";

    }

    public static isStaging(): boolean {

        return this.currentEnvironment === "staging";

    }

    public static isProduction(): boolean {

        return this.currentEnvironment === "production";

    }

}