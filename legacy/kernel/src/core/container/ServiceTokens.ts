/**
 * ============================================================================
 * AN Dev Studio
 * Service Tokens
 * ============================================================================
 *
 * Central registry of dependency injection tokens.
 *
 * Every framework service should be registered here.
 * ============================================================================
 */

export const ServiceTokens = {

  /**
   * ==========================================================================
   * Core
   * ==========================================================================
   */

  CONFIG: "core.config",

  LOGGER: "core.logger",

  EVENT_BUS: "core.eventBus",

  MODULE_REGISTRY: "core.moduleRegistry",

  MODULE_MANAGER: "core.moduleManager",

  MODULE_LOADER: "core.moduleLoader",

  SERVICE_CONTAINER: "core.serviceContainer",

  /**
   * ==========================================================================
   * Runtime
   * ==========================================================================
   */

  BOOTSTRAP: "runtime.bootstrap",

  APPLICATION: "runtime.application",

  HEALTH_MONITOR: "runtime.healthMonitor",

  /**
   * ==========================================================================
   * AI
   * ==========================================================================
   */

  AI_RUNTIME: "ai.runtime",

  AI_PROVIDER: "ai.provider",

  AI_MEMORY: "ai.memory",

  AI_PLANNER: "ai.planner",

  AI_GENERATOR: "ai.generator",

  AI_REVIEWER: "ai.reviewer",

  AI_RECOVERY: "ai.recovery",

  /**
   * ==========================================================================
   * Infrastructure
   * ==========================================================================
   */

  DATABASE: "infra.database",

  CACHE: "infra.cache",

  STORAGE: "infra.storage",

  /**
   * ==========================================================================
   * Security
   * ==========================================================================
   */

  AUTH_SERVICE: "security.auth",

  PERMISSION_SERVICE: "security.permissions",

} as const;

export type ServiceToken =
  (typeof ServiceTokens)[keyof typeof ServiceTokens];