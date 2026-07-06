import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class AuthAgent extends BaseFileAgent {
    readonly id = "auth";
    readonly label = "Auth Agent";
    readonly description = "Writes a single authentication/authorization module (session handling, guards, token verification).";
    readonly agentPath = "backend.auth";

    protected systemPrompt(): string {
        return (
            "You are a senior backend engineer specializing in authentication and authorization. Write a " +
            "single, complete auth-related module (session validation, route guard middleware, or token " +
            "verification, as specified by the task). Never hardcode secrets — read them from environment " +
            "variables or a config module. Output only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.moduleName as string | undefined) ?? "auth";
        return `src/lib/auth/${name}.ts`;
    }
}
