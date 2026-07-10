/**
 * ============================================================================
 * AN Dev Studio
 * Config Snapshot
 * ============================================================================
 */

import { RuntimeEnvironment } from "./Environment";

export interface ConfigSnapshot {

    total: number;

    readonly: number;

    environment: RuntimeEnvironment;

    keys: readonly string[];

}