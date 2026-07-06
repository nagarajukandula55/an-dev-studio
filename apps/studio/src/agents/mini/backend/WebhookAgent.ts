import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class WebhookAgent extends BaseFileAgent {
    readonly id = "webhook";
    readonly label = "Webhook Agent";
    readonly description = "Writes a single inbound webhook handler (signature verification, event routing).";
    readonly agentPath = "backend.webhook";

    protected systemPrompt(): string {
        return (
            "You are a senior backend engineer specializing in webhook integrations. Write a single, complete " +
            "webhook handler route: verify the request signature/secret before trusting the payload, parse the " +
            "event type, and route to the appropriate handler. Never process an unverified payload. Output " +
            "only the file's source code."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.routeName as string | undefined) ?? "webhook";
        return `src/app/api/webhooks/${name}/route.ts`;
    }
}
