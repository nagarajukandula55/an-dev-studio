import { GeneratedModule } from "./AutonomousModuleTypes";
import { ModuleManager } from "../../core/module/ModuleManager";

/**
 * ============================================================================
 * AN Dev Studio
 * Autonomous Module Registry
 * ============================================================================
 *
 * Safe registration layer for AI-generated modules.
 */

export class AutonomousModuleRegistry {
  private static modules: Map<string, GeneratedModule> = new Map();

  public static register(module: GeneratedModule): void {
    this.modules.set(module.id, module);
  }

  public static getAll(): GeneratedModule[] {
    return Array.from(this.modules.values());
  }

  public static async activate(module: GeneratedModule): Promise<void> {
    /**
     * In real system:
     * - validate schema
     * - sandbox execution
     * - dependency check
     */

    console.log(`[AUTO MODULE] Activating ${module.spec.name}`);

    await ModuleManager.initialize({
      id: module.id,
      name: module.spec.name,
      source: "ai-generated",
    } as any);
  }
}