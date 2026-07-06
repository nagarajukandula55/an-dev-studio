import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class EmailCopyAgent extends BaseFileAgent {
    readonly id = "email-copy";
    readonly label = "Email Copy Agent";
    readonly description = "Writes a single transactional or marketing email template's copy.";
    readonly agentPath = "marketing.email-copy";

    protected systemPrompt(): string {
        return (
            "You are a senior lifecycle/email marketing writer. Write clear, honest email copy for the " +
            "specified email (e.g. welcome, password reset, weekly digest). Include a subject line and body. " +
            "Output only the requested content, in markdown."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.emailName as string | undefined) ?? "email";
        return `marketing/emails/${name}.md`;
    }
}
