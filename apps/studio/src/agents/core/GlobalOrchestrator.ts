// ============================================================================
// AN Dev Studio — Global Orchestrator
//
// Top of the hierarchy. Takes a user's build request + chosen platform,
// asks the LLM to break it into a plan (a list of steps, each routed to one
// mini-orchestrator), then runs each mini-orchestrator's own planning/run
// loop. Every actual file write or command still flows through the
// ApprovalQueue — the orchestrator only ever produces *proposals*.
// ============================================================================

import type { AgentResult, MiniOrchestrator, OrchestrationPlan, ProjectContext } from "./types";
import { completeJson } from "./llm";
import { agentStatusRegistry } from "./AgentStatusRegistry";
import { addActivity } from "@/lib/activityLog";

import { uiMiniOrchestrator } from "../mini/ui";
import { backendMiniOrchestrator } from "../mini/backend";
import { databaseMiniOrchestrator } from "../mini/database";
import { testingMiniOrchestrator } from "../mini/testing";
import { devopsMiniOrchestrator } from "../mini/devops";
import { webPlatformMiniOrchestrator } from "../mini/platform-web";
import { windowsPlatformMiniOrchestrator } from "../mini/platform-windows";
import { androidPlatformMiniOrchestrator } from "../mini/platform-android";
import { iosPlatformMiniOrchestrator } from "../mini/platform-ios";
import { macosPlatformMiniOrchestrator } from "../mini/platform-macos";
import { marketingMiniOrchestrator } from "../mini/marketing";
import { automationMiniOrchestrator } from "../mini/automation";

const DOMAIN_ORCHESTRATORS: MiniOrchestrator[] = [
    uiMiniOrchestrator,
    backendMiniOrchestrator,
    databaseMiniOrchestrator,
    testingMiniOrchestrator,
    devopsMiniOrchestrator,
    marketingMiniOrchestrator,
    automationMiniOrchestrator,
];

const PLATFORM_ORCHESTRATORS: Record<string, MiniOrchestrator> = {
    web: webPlatformMiniOrchestrator,
    windows: windowsPlatformMiniOrchestrator,
    android: androidPlatformMiniOrchestrator,
    ios: iosPlatformMiniOrchestrator,
    macos: macosPlatformMiniOrchestrator,
};

export function allMiniOrchestrators(): MiniOrchestrator[] {
    return [...DOMAIN_ORCHESTRATORS, ...Object.values(PLATFORM_ORCHESTRATORS)];
}

let globalRegistered = false;
function ensureGlobalRegistered(): void {
    if (globalRegistered) return;
    agentStatusRegistry.register("global", "Global Orchestrator", "global");
    globalRegistered = true;
}

/**
 * Registers the entire org chart (global + every mini + every micro-agent)
 * as "idle" up front, so the dashboard's agent-status view shows the full
 * structure immediately on load — not just the agents that happen to have
 * run at least once. Safe to call multiple times (each register() is a
 * no-op for an id already known).
 */
export function registerAllAgents(): void {
    ensureGlobalRegistered();
    for (const orchestrator of allMiniOrchestrators()) {
        agentStatusRegistry.register(orchestrator.id, orchestrator.label, "mini", "global");
        for (const agent of orchestrator.microAgents) {
            agentStatusRegistry.register(`${orchestrator.id}.${agent.id}`, agent.label, "micro", orchestrator.id);
        }
    }
}

interface PlanResponse {
    rationale: string;
    steps: { miniOrchestratorId: string; description: string; input: Record<string, unknown> }[];
}

export class GlobalOrchestrator {
    /**
     * Only the mini-orchestrator for the project's chosen platform, plus the
     * platform-agnostic domain orchestrators, are ever consulted for a given
     * project — this is what makes platform selection actually scope the
     * work instead of firing every platform on every build.
     */
    private applicableOrchestrators(ctx: ProjectContext): MiniOrchestrator[] {
        const platformOrchestrator = PLATFORM_ORCHESTRATORS[ctx.platform];

        // iOS/macOS builds cannot run or be tested on this machine (Xcode-only,
        // macOS-only) — those platforms exist to propose source files for
        // later use elsewhere, so skip Testing entirely for them rather than
        // proposing tests that can never actually run here.
        const skipTesting = ctx.platform === "ios" || ctx.platform === "macos";
        const domains = skipTesting
            ? DOMAIN_ORCHESTRATORS.filter((o) => o.id !== "testing")
            : DOMAIN_ORCHESTRATORS;

        return platformOrchestrator ? [...domains, platformOrchestrator] : domains;
    }

    async plan(ctx: ProjectContext): Promise<OrchestrationPlan> {
        const candidates = this.applicableOrchestrators(ctx);
        const catalog = candidates
            .map((o) => `- id: "${o.id}" — ${o.label}: ${o.description}`)
            .join("\n");

        const response = await completeJson<PlanResponse>(
            `You are the global orchestrator for a software build system. A user wants to build:\n\n` +
            `"${ctx.prompt}"\n\nTarget platform: ${ctx.platform}\n\n` +
            `Available mini-orchestrators (route steps to these by id, exactly as spelled):\n${catalog}\n\n` +
            `Break this into an ordered list of steps. Each step names one mini-orchestrator id, a short ` +
            `description of what it should do, and any input data it needs (as a JSON object). Keep it to the ` +
            `minimum steps needed for a working first version — this is meant to produce a real, runnable slice, ` +
            `not an exhaustive spec.\n\n` +
            `Respond as JSON: { "rationale": string, "steps": [{ "miniOrchestratorId": string, "description": string, "input": object }] }`,
        );

        return {
            projectId: ctx.projectId,
            rationale: response.rationale,
            steps: response.steps.map((s, i) => ({
                miniOrchestratorId: s.miniOrchestratorId,
                task: { id: `${ctx.projectId}-step-${i}`, description: s.description, input: s.input ?? {} },
            })),
        };
    }

    async run(ctx: ProjectContext): Promise<{ plan: OrchestrationPlan; results: AgentResult[] }> {
        ensureGlobalRegistered();
        agentStatusRegistry.update("global", { state: "planning", currentProjectId: ctx.projectId, lastMessage: ctx.prompt });
        addActivity({ message: `Planning build: "${ctx.prompt}"`, agent: "global", status: "success", category: "orchestration" });

        const plan = await this.plan(ctx);
        const candidates = this.applicableOrchestrators(ctx);
        const results: AgentResult[] = [];

        agentStatusRegistry.update("global", { state: "running", lastMessage: plan.rationale });

        for (const step of plan.steps) {
            const orchestrator = candidates.find((o) => o.id === step.miniOrchestratorId);
            if (!orchestrator) {
                results.push({
                    taskId: step.task.id,
                    approvalRequestIds: [],
                    summary: `No mini-orchestrator found for id "${step.miniOrchestratorId}" — skipped.`,
                    success: false,
                    error: "unknown_mini_orchestrator",
                });
                continue;
            }

            const availability = await orchestrator.isAvailable();
            if (!availability.available) {
                results.push({
                    taskId: step.task.id,
                    approvalRequestIds: [],
                    summary: `${orchestrator.label} is unavailable: ${availability.reason ?? "unknown reason"}`,
                    success: false,
                    error: "orchestrator_unavailable",
                });
                continue;
            }

            const stepResults = await orchestrator.run(step.task, ctx);
            results.push(...stepResults);
        }

        const anyFailed = results.some((r) => !r.success);
        agentStatusRegistry.update("global", { state: anyFailed ? "error" : "success", lastMessage: `Build finished: ${results.length} task(s)` });
        addActivity({
            message: `Build finished: ${results.filter((r) => r.success).length}/${results.length} task(s) succeeded`,
            agent: "global",
            status: anyFailed ? "warning" : "success",
            category: "orchestration",
        });

        return { plan, results };
    }
}

export const globalOrchestrator = new GlobalOrchestrator();
