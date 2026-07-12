// ============================================================================
// AN Dev Studio — ImplementerAgent
//
// Writes/edits source files for one planned feature at a time. Always sees
// the shared ProjectManifest (focused on the feature's own files plus the
// wider tree) so imports/paths stay consistent with what's already there.
// ============================================================================

import { completeJson } from "../core/llm";
import type { ProjectContext } from "../core/types";
import type { Feature, FileProposalSpec } from "./types";
import { renderManifestForPrompt, type ProjectManifest } from "../manifest/ProjectManifest";
import { proposeFileWrite } from "./propose";

const SYSTEM_PROMPT =
    "You are the Implementer on a small AI engineering team. You write or edit the concrete source files " +
    "for exactly one feature at a time. Match the style, import conventions, and file layout already present " +
    "in the project manifest — never invent a different framework or folder convention than what's already " +
    "there. Write complete, working file contents (not diffs, not partial snippets).";

interface ImplementResponse {
    files: FileProposalSpec[];
}

export class ImplementerAgent {
    readonly id = "implementer";
    readonly label = "Implementer";
    readonly agentPath = "implementer";

    async run(ctx: ProjectContext, feature: Feature, manifest: ProjectManifest): Promise<string[]> {
        const response = await completeJson<ImplementResponse>(
            `User request: "${ctx.prompt}"\nTarget platform: ${ctx.platform}\n\n` +
                `Feature to implement: "${feature.title}"\n${feature.description}\n` +
                `Expected files: ${feature.files.join(", ") || "(not pre-specified — decide based on the plan)"}\n\n` +
                `${renderManifestForPrompt(manifest)}\n\n` +
                `Write the file(s) for this feature. Respond as JSON:\n` +
                `{ "files": [{ "relativePath": string, "content": string, "reason": string }] }`,
            { systemPrompt: SYSTEM_PROMPT },
        );

        return (response.files ?? []).map((f) =>
            proposeFileWrite(ctx, this.agentPath, f.relativePath, f.content, f.reason || feature.title),
        );
    }
}

export const implementerAgent = new ImplementerAgent();
