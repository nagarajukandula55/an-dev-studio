import { AgentRuntime } from "../../agents/runtime/AgentRuntime";
import { Orchestrator } from "../../agents/orchestrator/Orchestrator";
import {
  AIRuntimeRequest,
  AIRuntimeResponse,
} from "./AIRuntimeTypes";
import { AgentRole } from "../../agents/types/AgentTypes";

/**
 * ============================================================================
 * AN Dev Studio
 * AI Runtime Engine
 * ============================================================================
 *
 * Single entry point for all AI operations.
 */

export class AIRuntime {
  private agentRuntime: AgentRuntime;
  private orchestrator: Orchestrator;

  constructor() {
    this.agentRuntime = new AgentRuntime();
    this.orchestrator = new Orchestrator(this.agentRuntime);
  }

  public async run(
    request: AIRuntimeRequest
  ): Promise<AIRuntimeResponse> {
    try {
      // --------------------------------------------------
      // DIRECT MODE (skip orchestration)
      // --------------------------------------------------
      if (request.directMode && request.forceAgent) {
        const result = await this.agentRuntime.run(
          request.forceAgent,
          {
            taskId: request.requestId,
            request: request.input,
            metadata: request.context,
          }
        );

        return {
          requestId: request.requestId,
          success: result.success,
          output: result.output,
          logs: result.logs,
        };
      }

      // --------------------------------------------------
      // ORCHESTRATED MODE (default)
      // --------------------------------------------------
      const result = await this.orchestrator.execute({
        taskId: request.requestId,
        request: request.input,
        context: request.context,
      });

      return {
        requestId: request.requestId,
        success: result.success,
        output: result.results.map((r) => r.output),
      };
    } catch (error) {
      return {
        requestId: request.requestId,
        success: false,
        output: null,
        logs: [(error as Error).message],
      };
    }
  }
}