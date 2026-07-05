import { BaseFileAgent } from "../../core/BaseFileAgent";
import type { AgentTask } from "../../core/types";

export class TauriScaffoldAgent extends BaseFileAgent {
    readonly id = "tauri-scaffold";
    readonly label = "Tauri Scaffold Agent";
    readonly description = "Writes Windows-desktop scaffolding files (Tauri config, Rust shell entry point).";
    readonly agentPath = "platform-windows.tauri-scaffold";

    protected systemPrompt(): string {
        return (
            "You are a senior desktop platform engineer. Write a single, complete Tauri v2 config or Rust " +
            "entry-point file for wrapping a local web app as a Windows desktop application (the same pattern " +
            "already used in this project's own src-tauri/ folder). Output only the file's contents."
        );
    }

    protected resolveRelativePath(task: AgentTask): string {
        return (task.input.fileName as string | undefined) ?? "src-tauri/tauri.conf.json";
    }
}
