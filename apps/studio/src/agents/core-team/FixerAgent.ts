// ============================================================================
// AN Dev Studio — FixerAgent
//
// Consumes build/test stderr and the ProjectManifest, proposes minimal
// corrective file edits — used by BuildVerifier's verify-and-fix loop
// (Phase 3). Like every other core-team agent, it only ever proposes
// ApprovalRequests; it never touches disk directly.
// ============================================================================

import { completeJson } from "../core/llm";
import type { ProjectContext } from "../core/types";
import type { FileProposalSpec } from "./types";
import { renderManifestForPrompt, type ProjectManifest } from "../manifest/ProjectManifest";
import { proposeFileWrite } from "./propose";

const SYSTEM_PROMPT =
    "You are the Fixer on a small AI engineering team. You are given a build or test failure's error output " +
    "and the project's current files. Propose the minimal set of file edits that would fix the failure — " +
    "don't refactor or improve unrelated code, and don't guess at fixes unrelated to the actual error message. " +
    "If the fix requires editing an existing file, output its complete new contents (not a diff/patch).";

interface FixResponse {
    diagnosis: string;
    files: FileProposalSpec[];
}

export interface FixResult {
    diagnosis: string;
    requestIds: string[];
}

export class FixerAgent {
    readonly id = "fixer";
    readonly label = "Fixer";
    readonly agentPath = "fixer";

    async run(ctx: ProjectContext, errorOutput: string, manifest: ProjectManifest): Promise<FixResult> {
        const response = await completeJson<FixResponse>(
            `Project request: "${ctx.prompt}"\nTarget platform: ${ctx.platform}\n\n` +
                `${renderManifestForPrompt(manifest)}\n\n` +
                `Build/test failed with this output:\n${errorOutput.slice(0, 6000)}\n\n` +
                `Diagnose the failure and propose corrective file edits. Respond as JSON:\n` +
                `{ "diagnosis": string, "files": [{ "relativePath": string, "content": string, "reason": string }] }`,
            { systemPrompt: SYSTEM_PROMPT },
        );

        const requestIds = (response.files ?? []).map((f) =>
            proposeFileWrite(ctx, this.agentPath, f.relativePath, f.content, f.reason || `Fix: ${response.diagnosis}`),
        );

        return { diagnosis: response.diagnosis, requestIds };
    }
}

export const fixerAgent = new FixerAgent();
