/**
 * ============================================================================
 * @an-groups/config
 * Shared configuration utilities for AN Dev Studio packages
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

export type Environment = "development" | "production" | "test";

export function getEnvironment(): Environment {
    const env = process.env["NODE_ENV"];
    if (env === "production") return "production";
    if (env === "test")       return "test";
    return "development";
}

export function isDevelopment(): boolean { return getEnvironment() === "development"; }
export function isProduction():  boolean { return getEnvironment() === "production"; }
export function isTest():        boolean { return getEnvironment() === "test"; }

// ---------------------------------------------------------------------------
// Config schema helpers
// ---------------------------------------------------------------------------

export interface ConfigSchema {
    readonly [key: string]: ConfigValue;
}

export type ConfigValue =
    | string
    | number
    | boolean
    | null
    | ConfigValue[]
    | ConfigSchema;

/**
 * Safely read an environment variable, returning the fallback if absent.
 */
export function env(key: string, fallback: string): string;
export function env(key: string): string | undefined;
export function env(key: string, fallback?: string): string | undefined {
    return process.env[key] ?? fallback;
}

/**
 * Read an environment variable and coerce it to a number.
 */
export function envNumber(key: string, fallback: number): number {
    const raw = process.env[key];
    if (raw === undefined) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
}

/**
 * Read an environment variable and coerce it to a boolean.
 * Truthy: "1", "true", "yes", "on"
 */
export function envBool(key: string, fallback = false): boolean {
    const raw = process.env[key];
    if (raw === undefined) return fallback;
    return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

// ---------------------------------------------------------------------------
// Deep merge
// ---------------------------------------------------------------------------

export function deepMerge<T extends ConfigSchema>(
    base:     T,
    override: Partial<T>,
): T {
    const result = { ...base };
    for (const key of Object.keys(override) as (keyof T)[]) {
        const ov = override[key];
        const bv = base[key];
        if (
            ov !== null &&
            typeof ov === "object" &&
            !Array.isArray(ov) &&
            bv !== null &&
            typeof bv === "object" &&
            !Array.isArray(bv)
        ) {
            result[key] = deepMerge(
                bv as ConfigSchema,
                ov as Partial<ConfigSchema>,
            ) as T[keyof T];
        } else if (ov !== undefined) {
            result[key] = ov as T[keyof T];
        }
    }
    return result;
}
