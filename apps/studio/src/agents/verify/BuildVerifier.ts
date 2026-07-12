// ============================================================================
// AN Dev Studio — Build Verifier
//
// The verify-and-fix loop: after a batch of proposals is approved and
// applied, run the project's install/build/test commands, and on failure
// hand the error output to the FixerAgent for a corrective edit, then try
// again. Every command and every fix still goes through the ApprovalQueue —
// this class never touches disk or a shell directly, it only decides what
// to propose next and (when auto-approve is on for the project) calls
// approveAndApply() on its own proposals.
//
// Capped per the project's plan (lib/licensing/plans.ts — Free: 2 iterations,
// no auto-approve; Pro: 5 iterations, auto-approve allowed) to avoid an
// infinite fix-loop on an unfixable failure; on cap, returns a clear failure
// report rather than looping forever.
// ============================================================================

import fs from "fs";
import path from "path";
import type { ApprovalStatus, ProjectContext } from "../core/types";
import { approvalQueue } from "../core/ApprovalQueue";
import { buildProjectManifest } from "../manifest/ProjectManifest";
import { fixerAgent } from "../core-team/FixerAgent";
import { proposeCommand } from "../core-team/propose";
import { autoApproveStore } from "./AutoApproveStore";
import { insertVerifyIteration, listVerifyIterations } from "@/lib/db/verifyIterationsRepo";
import { licenseManager } from "@/lib/licensing/LicenseManager";
import { getPlanLimits } from "@/lib/licensing/plans";

// Ceiling across all plans (Pro's own cap, from plans.ts) — used for display/
// history reconstruction where no specific project's plan is in scope.
const MAX_ITERATIONS = getPlanLimits("pro").verifyLoopMaxIterations;

export interface VerifyCommandRecord {
    command: string;
    requestId: string;
    status: ApprovalStatus;
}

export interface VerifyIterationRecord {
    iteration: number;
    commands: VerifyCommandRecord[];
    fixerDiagnosis?: string;
    fixRequestIds?: string[];
}

export interface VerifyReport {
    projectId: string;
    success: boolean;
    capped: boolean;
    awaitingApproval: boolean;
    iterations: VerifyIterationRecord[];
    message: string;
}

interface DetectedCommand {
    command: string;
    cwd: string;
    reason: string;
}

/** Reads the project's package.json (if any) to decide what "install/build/test" means for this project. */
function detectCommands(ctx: ProjectContext): DetectedCommand[] {
    const pkgPath = path.join(ctx.targetFolder, "package.json");
    if (!fs.existsSync(pkgPath)) return [];

    let pkg: { dependencies?: object; devDependencies?: object; scripts?: Record<string, string> };
    try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    } catch {
        return [];
    }

    const commands: DetectedCommand[] = [];
    const hasDeps = !!(pkg.dependencies ?? pkg.devDependencies);
    const nodeModulesExists = fs.existsSync(path.join(ctx.targetFolder, "node_modules"));

    if (hasDeps && !nodeModulesExists) {
        commands.push({ command: "npm install", cwd: ".", reason: "Install dependencies before building/testing." });
    }
    if (pkg.scripts?.build) {
        commands.push({ command: "npm run build", cwd: ".", reason: "Build the project." });
    }
    if (pkg.scripts?.test) {
        commands.push({ command: "npm test", cwd: ".", reason: "Run the test suite." });
    }
    return commands;
}

class BuildVerifierImpl {
    // Fast path within this process's lifetime; the durable record is the
    // verify_iterations table (see the `finish` persistence below), so a
    // restart still has iteration history even though the exact summary
    // message/flags of the last in-progress run are process-local.
    private reports = new Map<string, VerifyReport>();

    getLastReport(projectId: string): VerifyReport | undefined {
        const cached = this.reports.get(projectId);
        if (cached) return cached;

        const iterations = listVerifyIterations(projectId);
        if (iterations.length === 0) return undefined;

        const last = iterations[iterations.length - 1];
        const lastIterationClean = last.commands.every((c) => c.status === "applied") && !last.fixRequestIds?.length;
        return {
            projectId,
            iterations,
            success: lastIterationClean,
            capped: iterations.length >= MAX_ITERATIONS && !lastIterationClean,
            awaitingApproval: last.commands.some((c) => c.status === "pending"),
            message: "Restored from persisted history (server restarted since this project last ran verify).",
        };
    }

    async run(ctx: ProjectContext): Promise<VerifyReport> {
        const iterations: VerifyIterationRecord[] = [];

        // Free plan: capped at 2 iterations, auto-approve unavailable regardless of the
        // project's stored toggle. Pro: full 5-iteration loop with auto-approve allowed.
        const planLimits = getPlanLimits(licenseManager.getStatus().plan);
        const maxIterations = planLimits.verifyLoopMaxIterations;
        const autoApprove = planLimits.autoApproveAllowed && autoApproveStore.get(ctx.projectId);

        for (let iteration = 1; iteration <= maxIterations; iteration++) {
            const detected = detectCommands(ctx);
            if (detected.length === 0) {
                return this.finish(ctx.projectId, iterations, {
                    success: true,
                    capped: false,
                    awaitingApproval: false,
                    message: "Nothing to verify — no package.json with a build/test script found for this project.",
                });
            }

            const commandRecords: VerifyCommandRecord[] = detected.map((d) => ({
                command: d.command,
                requestId: proposeCommand(ctx, "verify.builder", d.command, d.cwd, d.reason),
                status: "pending",
            }));

            if (!autoApprove) {
                this.recordIteration(ctx.projectId, iterations, { iteration, commands: commandRecords });
                return this.finish(ctx.projectId, iterations, {
                    success: false,
                    capped: false,
                    awaitingApproval: true,
                    message: "Verify commands proposed — awaiting approval (auto-approve is off for this project). Approve them, then run Verify again to continue.",
                });
            }

            let errorOutput: string | null = null;
            for (const record of commandRecords) {
                const applied = await approvalQueue.approveAndApply(record.requestId);
                record.status = applied?.status ?? "failed";
                if (applied?.status === "failed") {
                    errorOutput = `$ ${record.command}\n${applied.error ?? "(no error output captured)"}`;
                    break; // don't run later commands once an earlier one in this iteration failed
                }
            }

            if (!errorOutput) {
                this.recordIteration(ctx.projectId, iterations, { iteration, commands: commandRecords });
                return this.finish(ctx.projectId, iterations, {
                    success: true,
                    capped: false,
                    awaitingApproval: false,
                    message: `Build verified green after ${iteration} iteration(s).`,
                });
            }

            const manifest = buildProjectManifest(ctx.targetFolder);
            const fix = await fixerAgent.run(ctx, errorOutput, manifest);

            if (fix.requestIds.length > 0) {
                for (const id of fix.requestIds) {
                    await approvalQueue.approveAndApply(id);
                }
            }

            this.recordIteration(ctx.projectId, iterations, {
                iteration,
                commands: commandRecords,
                fixerDiagnosis: fix.diagnosis,
                fixRequestIds: fix.requestIds,
            });

            if (fix.requestIds.length === 0) {
                return this.finish(ctx.projectId, iterations, {
                    success: false,
                    capped: false,
                    awaitingApproval: false,
                    message: `Build failed and the Fixer could not propose a corrective edit. Diagnosis: ${fix.diagnosis}`,
                });
            }
        }

        return this.finish(ctx.projectId, iterations, {
            success: false,
            capped: true,
            awaitingApproval: false,
            message:
                `Verify loop capped at ${maxIterations} iteration(s) without reaching a green build.` +
                (planLimits.id === "free" ? " Upgrade to Pro for the full 5-iteration loop." : ""),
        });
    }

    private finish(
        projectId: string,
        iterations: VerifyIterationRecord[],
        rest: Pick<VerifyReport, "success" | "capped" | "awaitingApproval" | "message">,
    ): VerifyReport {
        const report: VerifyReport = { projectId, iterations, ...rest };
        this.reports.set(projectId, report);
        return report;
    }

    /** Records one iteration both in the returned report and durably in SQLite. */
    private recordIteration(projectId: string, iterations: VerifyIterationRecord[], record: VerifyIterationRecord): void {
        iterations.push(record);
        insertVerifyIteration(projectId, record);
    }
}

declare global {
    // eslint-disable-next-line no-var
    var __anDevStudioBuildVerifier: BuildVerifierImpl | undefined;
}

export const buildVerifier: BuildVerifierImpl =
    globalThis.__anDevStudioBuildVerifier ?? (globalThis.__anDevStudioBuildVerifier = new BuildVerifierImpl());
