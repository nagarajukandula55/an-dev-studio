/**
 * ============================================================================
 * AN Dev Studio
 * Bootstrap Context
 * ============================================================================
 *
 * Shared runtime context during system initialization.
 */

import { ServiceContainer } from "../container/ServiceContainer";
import { ConfigManager } from "../config/ConfigManager";

export interface BootstrapContext {
  services: typeof ServiceContainer;
  config: typeof ConfigManager;

  startTime: number;
}