import { AgentRuntime } from "../agents/runtime/AgentRuntime";
import { AgentRole } from "../agents/types/AgentTypes";

export class ANDevStudioCore {
  private runtime: AgentRuntime;

  constructor() {
    console.log("AN Dev Studio Core Initialized");
    this.runtime = new AgentRuntime();
  }

  async initialize() {
    console.log("System Ready");

    const result = await this.runtime.run(AgentRole.ARCHITECT, {
      taskId: "test-001",
      repository: "an-dev-studio",
      userRequest: "Design a multi-agent AI development system"
    });

    console.log("Architect Output:", JSON.stringify(result.output, null, 2));
  }
}