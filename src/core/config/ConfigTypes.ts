/**
 * ============================================================================
 * AN Dev Studio
 * Configuration System - Types
 * ============================================================================
 */

export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigObject
  | ConfigValue[];

export interface ConfigObject {
  [key: string]: ConfigValue;
}

/**
 * Configuration scope defines where config applies
 */
export type ConfigScope = "global" | "module" | "runtime";

/**
 * A single configuration entry
 */
export interface ConfigEntry {
  key: string;
  value: ConfigValue;
  scope: ConfigScope;
}