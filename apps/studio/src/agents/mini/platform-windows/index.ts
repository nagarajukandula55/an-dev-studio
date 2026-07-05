import { spawn } from "child_process";
import { BaseMiniOrchestrator } from "../../core/BaseMiniOrchestrator";
import type { MicroAgent } from "../../core/types";
import { TauriScaffoldAgent } from "./TauriScaffoldAgent";

function commandExists(cmd: string): Promise<boolean> {
    return new Promise((resolve) => {
        const child = spawn(process.platform === "win32" ? "where" : "which", [cmd], { windowsHide: true });
        child.on("error", () => resolve(false));
        child.on("exit", (code) => resolve(code === 0));
    });
}

class WindowsPlatformMiniOrchestrator extends BaseMiniOrchestrator {
    readonly id = "platform-windows";
    readonly label = "Windows Platform";
    readonly description = "Scaffolding for native Windows desktop apps via the Tauri shell (same pattern as this project's own desktop wrapper).";
    readonly microAgents: MicroAgent[] = [new TauriScaffoldAgent()];

    async isAvailable(): Promise<{ available: boolean; reason?: string }> {
        if (process.platform !== "win32") {
            return { available: false, reason: "This orchestrator targets Windows builds and this machine is not running Windows." };
        }
        const hasCargo = await commandExists("cargo");
        if (!hasCargo) {
            return {
                available: false,
                reason: "Rust/Cargo not found — run setup-desktop.ps1 first to install the Windows build toolchain.",
            };
        }
        return { available: true };
    }
}

export const windowsPlatformMiniOrchestrator = new WindowsPlatformMiniOrchestrator();
