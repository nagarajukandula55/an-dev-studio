import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class LayoutXmlAgent extends BaseFileAgent {
    readonly id = "layout-xml";
    readonly label = "Layout XML Agent";
    readonly description = "Writes a single Android XML layout resource file.";
    readonly agentPath = "platform-android.layout-xml";

    protected systemPrompt(): string {
        return (
            "You are a senior Android platform engineer. Write a single, complete Android XML layout resource " +
            "using ConstraintLayout conventions. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const name = (task.input.layoutName as string | undefined) ?? "activity_main";
        return `app/src/main/res/layout/${name}.xml`;
    }
}
