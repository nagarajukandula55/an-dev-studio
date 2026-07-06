import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class DockerfileAgent extends BaseFileAgent {
    readonly id = "dockerfile";
    readonly label = "Dockerfile Agent";
    readonly description = "Writes a single Dockerfile (or docker-compose file) for containerizing the project.";
    readonly agentPath = "devops.dockerfile";

    protected systemPrompt(): string {
        return (
            "You are a senior DevOps engineer. Write a single, complete Dockerfile (or docker-compose.yml, as " +
            "specified by the task) for this project: multi-stage build where sensible, minimal base image, " +
            "no unnecessary layers. Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        const fileName = (task.input.fileName as string | undefined) ?? "Dockerfile";
        return fileName;
    }
}
