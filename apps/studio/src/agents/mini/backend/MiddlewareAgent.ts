import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class MiddlewareAgent extends BaseFileAgent {
    readonly id = "middleware";
    readonly label = "Middleware Agent";
    readonly description = "Writes a single request middleware (logging, rate limiting, CORS, header handling).";
    readonly agentPath = "backend.middleware";

    protected systemPrompt(): string {
        return (
            "You are a senior backend engineer specializing in request/response middleware. Write a single, " +
            "complete middleware function for the project's framework (as inferred from the task/platform). " +
            "Keep it focused on one concern per file. Output only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.moduleName as string | undefined) ?? "middleware";
        return `src/lib/middleware/${name}.ts`;
    }
}
