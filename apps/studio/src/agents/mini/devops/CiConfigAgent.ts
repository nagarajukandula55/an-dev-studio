import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class CiConfigAgent extends BaseFileAgent {
    readonly id = "ci-config";
    readonly label = "CI Config Agent";
    readonly description = "Writes a single CI pipeline config file (e.g. GitHub Actions workflow).";
    readonly agentPath = "devops.ci-config";

    protected systemPrompt(): string {
        return (
            "You are a senior DevOps engineer. Write a single, complete CI pipeline config file (GitHub " +
            "Actions YAML unless the task specifies another provider) that installs dependencies, runs tests, " +
            "and builds the project. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.workflowName as string | undefined) ?? "ci";
        return `.github/workflows/${name}.yml`;
    }
}
