import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class CronJobAgent extends BaseFileAgent {
    readonly id = "cron-job";
    readonly label = "Scheduled Job Agent";
    readonly description = "Writes a single scheduled/recurring job file (cron-style task, background worker).";
    readonly agentPath = "automation.cron-job";

    protected systemPrompt(): string {
        return (
            "You are a senior automation engineer writing a scheduled/recurring job. Write a single, complete " +
            "job file with clear logging and error handling so failures are visible, not silent. Output only " +
            "the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.jobName as string | undefined) ?? "job";
        return `scripts/jobs/${name}.ts`;
    }
}
