import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class EnvConfigAgent extends BaseFileAgent {
    readonly id = "env-config";
    readonly label = "Environment Config Agent";
    readonly description = "Writes a single .env.example / environment documentation file listing required variables.";
    readonly agentPath = "devops.env-config";

    protected systemPrompt(): string {
        return (
            "You are a senior DevOps engineer. Write a single .env.example file documenting every environment " +
            "variable this project needs, with placeholder (non-real) values and a one-line comment above each " +
            "explaining its purpose. Never include a real secret value. Output only the file's contents."
        );
    }

    protected resolveRelativePath(): string {
        return ".env.example";
    }
}
