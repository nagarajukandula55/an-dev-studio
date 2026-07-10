// ============================================================================
// AN Dev Studio — PlannerAgent
//
// Turns the user's prompt into an ordered feature/file plan. Every other
// core-team agent works off this plan, so it's the one place project scope
// gets decided.
// ============================================================================

import { completeJson } from "../core/llm";
import type { ProjectContext } from "../core/types";
import type { BuildPlan } from "./types";
import type { ProjectManifest } from "../manifest/ProjectManifest";
import { renderManifestForPrompt } from "../manifest/ProjectManifest";

const SYSTEM_PROMPT =
    "You are the Planner on a small AI engineering team building real software projects. " +
    "You turn a one-line user request into a concrete, ordered, buildable plan — not an exhaustive " +
    "spec. Prefer the minimum feature set that produces a real, runnable first version. Every feature " +
    "must list the actual relative file paths it will create or edit, using conventional paths for the " +
    "chosen platform/framework so later agents can predict imports correctly.";

interface PlannerResponse {
    rationale: string;
    scaffoldNotes: string;
    features: { id: string; title: string; description: string; files: string[] }[];
}

export class PlannerAgent {
    readonly id = "planner";
    readonly label = "Planner";
    readonly agentPath = "planner";

    async plan(ctx: ProjectContext, manifest: ProjectManifest): Promise<BuildPlan> {
        const response = await completeJson<PlannerResponse>(
            `User request: "${ctx.prompt}"\nTarget platform: ${ctx.platform}\n\n` +
                `${renderManifestForPrompt(manifest)}\n\n` +
                `Produce a build plan. Respond as JSON:\n` +
                `{ "rationale": string, "scaffoldNotes": string, "features": [{ "id": string, "title": string, ` +
                `"description": string, "files": string[] }] }\n\n` +
                `"scaffoldNotes" tells the Scaffolder what framework/config/deps to set up. Each feature's ` +
                `"files" lists every relative file path (from the project root) that feature will create or edit.`,
            { systemPrompt: SYSTEM_PROMPT },
        );

        return {
            rationale: response.rationale,
            scaffoldNotes: response.scaffoldNotes,
            features: response.features.map((f, i) => ({
                id: f.id || `feature-${i}`,
                title: f.title,
                description: f.description,
                files: f.files ?? [],
            })),
        };
    }
}

export const plannerAgent = new PlannerAgent();
