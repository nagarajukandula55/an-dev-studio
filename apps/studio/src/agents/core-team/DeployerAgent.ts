// ============================================================================
// AN Dev Studio — DeployerAgent
//
// Generates run/deploy config (Dockerfile, vercel.json, CI workflow, etc.)
// for the chosen platform. Platform specifics keyed by ctx.platform via
// platformKnowledge.ts.
// ============================================================================

import { completeJson } from "../core/llm";
import type { ProjectContext } from "../core/types";
import type { FileProposalSpec } from "./types";
import { renderManifestForPrompt, type ProjectManifest } from "../manifest/ProjectManifest";
import { proposeFileWrite } from "./propose";
import { deployNotesFor } from "./platformKnowledge";

const SYSTEM_PROMPT =
    "You are the Deployer on a small AI engineering team. You generate run/deploy configuration for a " +
    "finished project — containerization, hosting config, or documented build/release steps, depending on " +
    "the platform. Only propose files that make sense for the target platform; don't containerize a native " +
    "mobile/desktop app, for example.";

interface DeployResponse {
    files: FileProposalSpec[];
}

export class DeployerAgent {
    readonly id = "deployer";
    readonly label = "Deployer";
    readonly agentPath = "deployer";

    async run(ctx: ProjectContext, manifest: ProjectManifest): Promise<string[]> {
        const response = await completeJson<DeployResponse>(
            `Project request: "${ctx.prompt}"\nTarget platform: ${ctx.platform}\n` +
                `Deploy conventions for this platform: ${deployNotesFor(ctx.platform)}\n\n` +
                `${renderManifestForPrompt(manifest)}\n\n` +
                `Propose the run/deploy config files. Respond as JSON:\n` +
                `{ "files": [{ "relativePath": string, "content": string, "reason": string }] }`,
            { systemPrompt: SYSTEM_PROMPT },
        );

        return (response.files ?? []).map((f) =>
            proposeFileWrite(ctx, this.agentPath, f.relativePath, f.content, f.reason || "Deploy config"),
        );
    }
}

export const deployerAgent = new DeployerAgent();
