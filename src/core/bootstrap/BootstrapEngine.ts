import { BootstrapPhase } from "./BootstrapPhase";
import { BootstrapContext } from "./BootstrapContext";
import { ConfigManager } from "../config/ConfigManager";
import { ServiceContainer } from "../container/ServiceContainer";
import { ServiceBootstrap } from "../container/bootstrap";
import { ModuleManager } from "../module/ModuleManager";
import { AgentBootstrap } from "../../agents/bootstrap";
import { AIModuleListener } from "../../ai/integration/AIModuleListener";
import { EventBus } from "../events/EventBus";
import { EventFactory } from "../events/EventFactory";
import { EventTypes } from "../events/EventTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * Bootstrap Engine (AI Integrated)
 * ============================================================================
 */

export class BootstrapEngine {
  private static phase: BootstrapPhase = BootstrapPhase.CONFIGURATION;

  public static async start(): Promise<BootstrapContext> {
    const context: BootstrapContext = {
      services: ServiceContainer,
      config: ConfigManager,
      startTime: Date.now(),
    };

    // --------------------------------------------------
    // CONFIGURATION
    // --------------------------------------------------
    this.phase = BootstrapPhase.CONFIGURATION;

    ConfigManager.set("system.startTime", context.startTime);
    ConfigManager.set("system.mode", "development");

    // --------------------------------------------------
    // SERVICES
    // --------------------------------------------------
    this.phase = BootstrapPhase.SERVICES;

    ServiceBootstrap.initialize();

    // --------------------------------------------------
    // EVENTS
    // --------------------------------------------------
    this.phase = BootstrapPhase.EVENTS;

    await ServiceContainer.resolve("core.eventBus");

    // Emit system boot event (IMPORTANT)
    await EventBus.emit(
      EventFactory.create(EventTypes.SYSTEM_BOOT, {
        time: Date.now(),
      })
    );

    // --------------------------------------------------
    // AI SYSTEM
    // --------------------------------------------------
    AgentBootstrap.initialize();
    AIModuleListener.initialize();

    // --------------------------------------------------
    // MODULES
    // --------------------------------------------------
    const ModuleRegistry = await ServiceContainer.resolve<any>(
      "core.moduleRegistry"
    );

    const modules = ModuleRegistry.getAll?.() ?? [];

    for (const descriptor of modules) {
      await ModuleManager.initialize(descriptor.module);
    }

    // --------------------------------------------------
    // COMPLETE
    // --------------------------------------------------
    this.phase = BootstrapPhase.COMPLETE;

    ConfigManager.set("system.booted", true);

    console.log("[Bootstrap] System fully initialized with AI layer");

    return context;
  }

  public static getPhase(): BootstrapPhase {
    return this.phase;
  }
}