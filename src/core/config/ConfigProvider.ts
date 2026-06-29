/**
 * ============================================================================
 * AN Dev Studio
 * Config Provider
 * ============================================================================
 */

import { ConfigValue } from "./ConfigTypes";

export interface ConfigProvider {

    /**
     * Provider name.
     */
    readonly name: string;

    /**
     * Load configuration.
     */
    load(): Promise<Record<string, ConfigValue>>;

}