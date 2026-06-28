/**
 * ============================================================================
 * AN Dev Studio
 * Framework Bootstrap
 * ============================================================================
 *
 * Registers all framework services.
 *
 * This class MUST be executed exactly once during
 * application startup.
 *
 * ============================================================================
 */

import { ServiceContainer } from "./ServiceContainer";
import { ServiceTokens } from "./ServiceTokens";

export class ServiceBootstrap {

  private static initialized = false;

  /**
   * Initialize framework services.
   */
  public static initialize(): void {

    if (this.initialized) {
      return;
    }

    this.initialized = true;

    this.registerCore();

    this.registerModules();

    this.registerAIRuntime();

  }

  /**
   * ==========================================================================
   * Core Services
   * ==========================================================================
   */
  private static registerCore(): void {

    ServiceContainer.register(
      ServiceTokens.EVENT_BUS,
      async () => {
        const { EventBus } = await import("../events/EventBus");
        return EventBus;
      }
    );

    ServiceContainer.register(
      ServiceTokens.MODULE_REGISTRY,
      async () => {
        const { ModuleRegistry } =
          await import("../module/ModuleRegistry");

        return ModuleRegistry;
      }
    );

    ServiceContainer.register(
      ServiceTokens.MODULE_MANAGER,
      async () => {
        const { ModuleManager } =
          await import("../module/ModuleManager");

        return ModuleManager;
      }
    );

    ServiceContainer.register(
      ServiceTokens.MODULE_LOADER,
      async () => {
        const { ModuleLoader } =
          await import("../module/ModuleLoader");

        return ModuleLoader;
      }
    );

  }

  /**
   * ==========================================================================
   * Module Services
   * ==========================================================================
   */
  private static registerModules(): void {

    /**
     * Reserved for future module discovery.
     */

  }

  /**
   * ==========================================================================
   * AI Runtime
   * ==========================================================================
   */
  private static registerAIRuntime(): void {

    /**
     * Register AI Runtime later.
     *
     * Example:
     *
     * ServiceContainer.register(
     *   ServiceTokens.AI_RUNTIME,
     *   async () => {
     *      const { AIRuntime } =
     *        await import("../../ai/runtime/AIRuntime");
     *
     *      return new AIRuntime();
     *   }
     * );
     */

  }

}