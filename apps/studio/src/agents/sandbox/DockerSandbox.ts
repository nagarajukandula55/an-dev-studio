// ============================================================================
// AN Dev Studio — Docker Sandbox Executor
//
// Approved shell commands run here, inside a throwaway container with the
// project folder bind-mounted, rather than directly on the user's machine.
// This bounds the blast radius of a bad or malicious command to the
// container + the one project folder it can see.
//
// Requires Docker Desktop. If it's not installed/running, ApprovalQueue
// falls back to running commands directly on the host (see ApprovalQueue.ts)
// — so this stays usable for people who haven't set up Docker yet, at the
// cost of losing the isolation guarantee. The Settings/DevOps UI should
// surface clearly which mode is active.
// ============================================================================

import { spawn } from "child_process";

// Generic image with node, python, git, and common build tooling.
// Swap for a custom-built image later if specific toolchains are needed.
const SANDBOX_IMAGE = "node:22-bookworm";

let cachedAvailability: { value: boolean; checkedAt: number } | null = null;
const AVAILABILITY_CACHE_MS = 30_000;

export async function isDockerAvailable(): Promise<boolean> {
    if (cachedAvailability && Date.now() - cachedAvailability.checkedAt < AVAILABILITY_CACHE_MS) {
        return cachedAvailability.value;
    }

    const available = await new Promise<boolean>((resolve) => {
        const child = spawn("docker", ["info"], { windowsHide: true });
        child.on("error", () => resolve(false));
        child.on("exit", (code) => resolve(code === 0));
    });

    cachedAvailability = { value: available, checkedAt: Date.now() };
    return available;
}

export interface SandboxResult {
    code: number | null;
    stdout: string;
    stderr: string;
}

/**
 * Runs `command` inside a fresh container with `hostCwd` bind-mounted at
 * /workspace (and used as the container's working directory). The container
 * is removed after the command finishes (--rm). Always resolves with the
 * captured output and exit code — callers (ApprovalQueue, BuildVerifier)
 * decide what a non-zero exit means, rather than this function throwing and
 * discarding stdout in the process.
 */
export async function runInSandbox(command: string, hostCwd: string): Promise<SandboxResult> {
    return new Promise<SandboxResult>((resolve, reject) => {
        const dockerArgs = [
            "run",
            "--rm",
            "--network", "bridge",
            "-v", `${hostCwd}:/workspace`,
            "-w", "/workspace",
            SANDBOX_IMAGE,
            "sh", "-c", command,
        ];

        const child = spawn("docker", dockerArgs, { windowsHide: true });
        let stdout = "";
        let stderr = "";
        child.stdout?.on("data", (d) => { stdout += d.toString(); });
        child.stderr?.on("data", (d) => { stderr += d.toString(); });
        child.on("error", reject);
        child.on("exit", (code) => resolve({ code, stdout, stderr }));
    });
}
