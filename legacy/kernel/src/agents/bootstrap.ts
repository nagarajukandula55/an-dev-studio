import { AgentRegistry } from "./registry/AgentRegistry";
import { ArchitectAgent } from "./impl/ArchitectAgent";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Bootstrap
 * ============================================================================
 */

export class AgentBootstrap {
  public static initialize(): void {
    // Register core agents
    AgentRegistry.register(new ArchitectAgent());

    console.log("[AI] Agent system initialized");
  }
}