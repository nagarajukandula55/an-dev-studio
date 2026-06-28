import { ConfigStore } from "./ConfigStore";
import { ConfigValue } from "./ConfigTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * Configuration Manager
 * ============================================================================
 *
 * Higher-level API for configuration handling.
 */

export class ConfigManager {
  /**
   * Set value
   */
  public static set(key: string, value: ConfigValue): void {
    ConfigStore.set(key, value);
  }

  /**
   * Get value with fallback support
   */
  public static get<T = ConfigValue>(
    key: string,
    fallback?: T
  ): T {
    const value = ConfigStore.get<T>(key);

    if (value === undefined) {
      return fallback as T;
    }

    return value;
  }

  /**
   * Merge object config
   */
  public static merge(key: string, value: object): void {
    const existing = ConfigStore.get<object>(key) || {};
    ConfigStore.set(key, { ...existing, ...value });
  }

  /**
   * Reset config system
   */
  public static reset(): void {
    ConfigStore.clear();
  }
}