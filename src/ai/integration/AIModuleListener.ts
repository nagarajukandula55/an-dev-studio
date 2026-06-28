import { EventBus } from "../../core/events/EventBus";
import { AgentRole } from "../../agents/types/AgentTypes";
import { ai } from "../runtime";
import { GapDetector } from "../autonomous/GapDetector";
import { EventMap } from "../../core/events/EventMap";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Module Listener (FINAL FIXED VERSION)
 * ============================================================================
 */

export class AIModuleListener {
  public static initialize(): void {
    /**
     * -----------------------------------------------------
     * MODULE GAP DETECTED
     * -----------------------------------------------------
     */
    EventBus.on("module.gap.detected", async (event) => {
      const gap = event.payload.gap;

      await GapDetector.detectAndFix(gap);
    });

    /**
     * -----------------------------------------------------
     * MODULE INITIALIZED
     * -----------------------------------------------------
     */
    EventBus.on("module.initialized", async (event) => {
      await ai.run({
        requestId: `ai-${Date.now()}`,
        input: `Analyze module initialization: ${event.payload.name}`,
        forceAgent: AgentRole.ARCHITECT,
        directMode: true,
      });
    });

    /**
     * -----------------------------------------------------
     * MODULE FAILED
     * -----------------------------------------------------
     */
    EventBus.on("module.failed", async (event) => {
      await ai.run({
        requestId: `ai-${Date.now()}`,
        input: `Diagnose module failure: ${event.payload.moduleId}`,
        forceAgent: AgentRole.REVIEWER,
        directMode: true,
      });
    });

    /**
     * -----------------------------------------------------
     * SYSTEM BOOT
     * -----------------------------------------------------
     */
    EventBus.on("system.boot", async (event) => {
      await ai.run({
        requestId: `ai-boot`,
        input: `System started at ${event.payload.time}. Analyze architecture state.`,
        forceAgent: AgentRole.ARCHITECT,
        directMode: true,
      });
    });
  }
}