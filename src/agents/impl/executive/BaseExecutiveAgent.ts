import {
  ExecutiveAgentInput,
  ExecutiveAgentOutput
} from "../../types/AgentTypes";

export abstract class BaseExecutiveAgent {
  abstract name: string;

  abstract execute(
    input: ExecutiveAgentInput
  ): Promise<ExecutiveAgentOutput>;

  protected build(
    partial: Partial<ExecutiveAgentOutput>
  ): ExecutiveAgentOutput {
    return {
      insights: partial.insights ?? [],
      decisions: partial.decisions ?? {},
      confidence: partial.confidence ?? 0.5,
      nextActions: partial.nextActions ?? [],
      metadata: partial.metadata ?? {}
    };
  }
}