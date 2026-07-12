// ============================================================================
// AN Dev Studio — ScaffolderAgent
//
// Creates the project skeleton: framework config, folder structure, deps
// manifest. Platform-specific knowledge (Web/Windows/Android/iOS/macOS) is
// keyed by ctx.platform via platformKnowledge.ts rather than living in
// separate per-platform agents.
// ============================================================================

import { completeJson } from "../core/llm";
import type { ProjectContext } from "../core/types";
import type { BuildPlan, FileProposalSpec } from "./types";
import { renderManifestForPrompt, type ProjectManifest } from "../manifest/ProjectManifest";
import { proposeFileWrite } from "./propose";
import { scaffoldNotesFor, checkPlatformAvailability, type PlatformAvailability } from "./platformKnowledge";

const SYSTEM_PROMPT =
    "You are the Scaffolder on a small AI engineering team. You create the initial project skeleton: " +
    "framework/config files, folder structure, and a dependency manifest. Only propose files that don't " +
    "already exist (skip anything already present in the manifest) unless the plan explicitly calls for " +
    "changing them. Output real, working config — no placeholders like \"TODO\" left in generated content.";

interface ScaffoldResponse {
    files: FileProposalSpec[];
}

export class ScaffolderAgent {
    readonly id = "scaffolder";
    readonly label = "Scaffolder";
    readonly agentPath = "scaffolder";

    async isAvailable(ctx: ProjectContext): Promise<PlatformAvailability> {
        return checkPlatformAvailability(ctx.platform);
    }

    async run(ctx: ProjectContext, plan: BuildPlan, manifest: ProjectManifest): Promise<string[]> {
        const response = await completeJson<ScaffoldResponse>(
            `User request: "${ctx.prompt}"\nTarget platform: ${ctx.platform}\n` +
                `Platform scaffolding conventions: ${scaffoldNotesFor(ctx.platform)}\n` +
                `Plan's scaffold notes: ${plan.scaffoldNotes}\n\n` +
                `${renderManifestForPrompt(manifest)}\n\n` +
                `Propose the initial scaffold files. Respond as JSON:\n` +
                `{ "files": [{ "relativePath": string, "content": string, "reason": string }] }`,
            { systemPrompt: SYSTEM_PROMPT },
        );

        return (response.files ?? []).map((f) =>
            proposeFileWrite(ctx, this.agentPath, f.relativePath, f.content, f.reason || "Project scaffold"),
        );
    }
}

export const scaffolderAgent = new ScaffolderAgent();
