import { ConfigEntry, ConfigValue } from "./ConfigTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * Configuration Store
 * ============================================================================
 *
 * Central in-memory configuration system.
 */

export class ConfigStore {
  private static store: Map<string, ConfigEntry> = new Map();

  /**
   * Set configuration value
   */
  public static set(
    key: string,
    value: ConfigValue,
    scope: ConfigEntry["scope"] = "global"
  ): void {
    this.store.set(key, { key, value, scope });
  }

  /**
   * Get configuration value
   */
  public static get<T = ConfigValue>(key: string): T | undefined {
    return this.store.get(key)?.value as T | undefined;
  }

  /**
   * Check if config exists
   */
  public static has(key: string): boolean {
    return this.store.has(key);
  }

  /**
   * Remove config
   */
  public static delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Get all configs
   */
  public static getAll(): ConfigEntry[] {
    return Array.from(this.store.values());
  }

  /**
   * Clear all configs (testing/reset)
   */
  public static clear(): void {
    this.store.clear();
  }
}