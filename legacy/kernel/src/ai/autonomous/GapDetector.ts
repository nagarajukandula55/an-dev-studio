import { ai } from "../runtime";
import { AgentRole } from "../../agents/types/AgentTypes";
import { ModuleGenerator } from "./ModuleGenerator";
import { AutonomousModuleRegistry } from "./AutonomousModuleRegistry";

/**
 * ============================================================================
 * AN Dev Studio
 * Gap Detector
 * ============================================================================
 *
 * Detects missing system capabilities and triggers module creation.
 */

export class GapDetector {
  public static async detectAndFix(gap: string): Promise<void> {
    console.log(`[AI GAP DETECTED] ${gap}`);

    // Step 1: Generate module
    const module = await ModuleGenerator.proposeModule(gap);

    // Step 2: Register safely
    AutonomousModuleRegistry.register(module);

    // Step 3: Activate
    await AutonomousModuleRegistry.activate(module);

    // Step 4: AI validation
    await ai.run({
      requestId: `validate-${Date.now()}`,
      input: `Validate newly created module: ${module.spec.name}`,
      forceAgent: AgentRole.REVIEWER,
      directMode: true,
    });
  }
}