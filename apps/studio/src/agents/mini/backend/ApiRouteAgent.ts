import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class ApiRouteAgent extends BaseFileAgent {
    readonly id = "api-route";
    readonly label = "API Route Agent";
    readonly description = "Writes a single backend API route/handler file.";
    readonly agentPath = "backend.api-route";

    protected systemPrompt(): string {
        return (
            "You are a senior backend engineer. Write a single, complete API route handler. Validate input, " +
            "handle errors explicitly, and never trust client input blindly. Output only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.routeName as string | undefined) ?? "resource";
        return `src/app/api/${name}/route.ts`;
    }
}
