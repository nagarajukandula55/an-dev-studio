import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class SeoAgent extends BaseFileAgent {
    readonly id = "seo";
    readonly label = "SEO Agent";
    readonly description = "Writes a single SEO metadata file (meta tags, structured data, sitemap entry copy).";
    readonly agentPath = "marketing.seo";

    protected systemPrompt(): string {
        return (
            "You are a senior SEO specialist. Write accurate, non-keyword-stuffed metadata: a title, meta " +
            "description, and (if relevant) JSON-LD structured data for the page described in the task. " +
            "Output only the requested content."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.pageName as string | undefined) ?? "page";
        return `marketing/seo/${name}.json`;
    }
}
