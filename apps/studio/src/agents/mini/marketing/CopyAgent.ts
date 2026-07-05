import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class CopyAgent extends BaseFileAgent {
    readonly id = "copy";
    readonly label = "Copy Agent";
    readonly description = "Writes marketing copy (landing page text, feature descriptions, taglines) as a content file.";
    readonly agentPath = "marketing.copy";

    protected systemPrompt(): string {
        return (
            "You are a senior product marketing writer. Write clear, honest, benefit-focused copy — no " +
            "exaggerated claims. Output only the requested content, in markdown."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.contentName as string | undefined) ?? "landing-copy";
        return `marketing/${name}.md`;
    }
}
