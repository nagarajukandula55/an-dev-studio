// ============================================================================
// AN Dev Studio — Global Orchestrator
//
// Top-level planner/router over the six core-team agents (Planner,
// Scaffolder, Implementer, Reviewer, Fixer, Deployer — see
// ../core-team/**). Takes a user's build request + chosen platform, gets a
// BuildPlan from the Planner, has the Scaffolder lay down the project
// skeleton, then runs the Implementer + Reviewer for each planned feature in
// turn, and finally the Deployer. Every actual file write or command still
// flows through the ApprovalQueue — this class only ever produces
// *proposals*, gated on human approval.
//
// Replaces the old GlobalOrchestrator -> ~12 MiniOrchestrator -> ~48
// MicroAgent hierarchy (see legacy notes in docs/audit.md): six
// context-aware agents sharing one ProjectManifest produce more coherent
// multi-file output than dozens of single-file micro-agents working in
// isolation.
// ============================================================================

import type { AgentResult, ProjectContext } from "./types";
import { agentStatusRegistry } from "./AgentStatusRegistry";
import { addActivity } from "@/lib/activityLog";
import { buildProjectManifest } from "../manifest/ProjectManifest";
import { plannerAgent } from "../core-team/PlannerAgent";
import { scaffolderAgent } from "../core-team/ScaffolderAgent";
import { implementerAgent } from "../core-team/ImplementerAgent";
import { reviewerAgent } from "../core-team/ReviewerAgent";
import { deployerAgent } from "../core-team/DeployerAgent";
import type { BuildPlan } from "../core-team/types";

const CORE_TEAM_AGENTS = [
    { id: "planner", label: "Planner" },
    { id: "scaffolder", label: "Scaffolder" },
    { id: "implementer", label: "Implementer" },
    { id: "reviewer", label: "Reviewer" },
    { id: "fixer", label: "Fixer" },
    { id: "deployer", label: "Deployer" },
] as const;

let globalRegistered = false;
function ensureGlobalRegistered(): void {
    if (globalRegistered) return;
    agentStatusRegistry.register("global", "Global Orchestrator", "global");
    for (const agent of CORE_TEAM_AGENTS) {
        agentStatusRegistry.register(agent.id, agent.label, "mini", "global");
    }
    globalRegistered = true;
}

/** Registers the whole org chart as "idle" up front so the dashboard shows it immediately. Safe to call repeatedly. */
export function registerAllAgents(): void {
    ensureGlobalRegistered();
}

export interface GlobalRunOutcome {
    plan: BuildPlan & { projectId: string };
    results: AgentResult[];
}

export class GlobalOrchestrator {
    async run(ctx: ProjectContext): Promise<GlobalRunOutcome> {
        ensureGlobalRegistered();
        agentStatusRegistry.update("global", { state: "planning", currentProjectId: ctx.projectId, lastMessage: ctx.prompt });
        addActivity({ message: `Planning build: "${ctx.prompt}"`, agent: "global", status: "success", category: "orchestration" });

        const results: AgentResult[] = [];

        // 1. Plan — the Planner sees whatever's already in the target folder too, so
        //    re-runs on an existing project extend rather than re-scaffold it.
        agentStatusRegistry.update("planner", { state: "running", currentProjectId: ctx.projectId });
        const initialManifest = buildProjectManifest(ctx.targetFolder);
        const plan = await plannerAgent.plan(ctx, initialManifest);
        agentStatusRegistry.update("planner", { state: "success", lastMessage: plan.rationale });
        agentStatusRegistry.update("global", { state: "running", lastMessage: plan.rationale });

        // 2. Scaffold — project skeleton, platform-specific.
        agentStatusRegistry.update("scaffolder", { state: "running", currentProjectId: ctx.projectId });
        const availability = await scaffolderAgent.isAvailable(ctx);
        if (!availability.available) {
            results.push({
                taskId: `${ctx.projectId}-scaffold`,
                approvalRequestIds: [],
                summary: `Scaffolder: ${ctx.platform} is unavailable — ${availability.reason ?? "unknown reason"}. Proposing source files anyway; nothing can be verified/built on this machine.`,
                success: false,
                error: "platform_unavailable",
            });
            agentStatusRegistry.update("scaffolder", { state: "error", lastMessage: availability.reason });
        }

        const scaffoldRequestIds = await scaffolderAgent.run(ctx, plan, initialManifest);
        agentStatusRegistry.update("scaffolder", { state: "success", lastMessage: `Proposed ${scaffoldRequestIds.length} scaffold file(s).` });
        results.push({
            taskId: `${ctx.projectId}-scaffold`,
            approvalRequestIds: scaffoldRequestIds,
            summary: `Scaffolder proposed ${scaffoldRequestIds.length} file(s).`,
            success: true,
        });

        // 3. Implement + Review each feature in turn — always against a fresh manifest
        //    focused on that feature's files, so later features see what earlier ones proposed.
        for (const feature of plan.features) {
            agentStatusRegistry.update("implementer", { state: "running", currentProjectId: ctx.projectId, lastMessage: feature.title });

            const manifest = buildProjectManifest(ctx.targetFolder, { focusPaths: feature.files });
            const requestIds = await implementerAgent.run(ctx, feature, manifest);
            agentStatusRegistry.update("implementer", { state: "success", lastMessage: `${feature.title}: proposed ${requestIds.length} file(s).` });

            agentStatusRegistry.update("reviewer", { state: "running", currentProjectId: ctx.projectId, lastMessage: feature.title });
            const review = await reviewerAgent.review(ctx, requestIds, manifest);
            agentStatusRegistry.update("reviewer", {
                state: review.ok ? "success" : "error",
                lastMessage: review.ok ? `${feature.title}: no coherence issues.` : `${feature.title}: ${review.issues.length} issue(s) found.`,
            });

            const errorIssues = review.issues.filter((i) => i.severity === "error");
            results.push({
                taskId: feature.id,
                approvalRequestIds: requestIds,
                summary:
                    `${feature.title}: proposed ${requestIds.length} file(s). ` +
                    (review.issues.length === 0
                        ? "Reviewer found no coherence issues."
                        : `Reviewer flagged ${review.issues.length} issue(s): ${review.issues.map((i) => `${i.relativePath} — ${i.message}`).join("; ")}`),
                success: errorIssues.length === 0,
                error: errorIssues.length > 0 ? "review_flagged_errors" : undefined,
            });
        }

        // 4. Deploy config — always proposed last, once the project shape exists.
        agentStatusRegistry.update("deployer", { state: "running", currentProjectId: ctx.projectId });
        const finalManifest = buildProjectManifest(ctx.targetFolder);
        const deployRequestIds = await deployerAgent.run(ctx, finalManifest);
        agentStatusRegistry.update("deployer", { state: "success", lastMessage: `Proposed ${deployRequestIds.length} deploy config file(s).` });
        results.push({
            taskId: `${ctx.projectId}-deploy`,
            approvalRequestIds: deployRequestIds,
            summary: `Deployer proposed ${deployRequestIds.length} file(s).`,
            success: true,
        });

        const anyFailed = results.some((r) => !r.success);
        agentStatusRegistry.update("global", { state: anyFailed ? "error" : "success", lastMessage: `Build finished: ${results.length} task(s)` });
        addActivity({
            message: `Build finished: ${results.filter((r) => r.success).length}/${results.length} task(s) succeeded`,
            agent: "global",
            status: anyFailed ? "warning" : "success",
            category: "orchestration",
        });

        return { plan: { ...plan, projectId: ctx.projectId }, results };
    }
}

export const globalOrchestrator = new GlobalOrchestrator();
