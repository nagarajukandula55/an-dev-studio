/**
 * ============================================================================
 * AN Dev Studio
 * Configuration Types
 * ============================================================================
 */

export type ConfigValue =
    | string
    | number
    | boolean
    | null
    | ConfigValue[]
    | {
        [key: string]: ConfigValue;
    };

export interface ConfigEntry<T = ConfigValue> {

    key: string;

    value: T;

    description?: string;

    readonly?: boolean;

}