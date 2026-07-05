import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class WebScaffoldAgent extends BaseFileAgent {
    readonly id = "web-scaffold";
    readonly label = "Web Scaffold Agent";
    readonly description = "Writes web-project scaffolding files (package.json, config files).";
    readonly agentPath = "platform-web.web-scaffold";

    protected systemPrompt(): string {
        return (
            "You are a senior web platform engineer. Write a single, complete scaffolding/config file for a " +
            "Next.js + TypeScript web project (e.g. package.json, tsconfig.json, next.config.ts). Output only " +
            "the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        return (task.input.fileName as string | undefined) ?? "package.json";
    }
}
