// ============================================================================
// AN Dev Studio — ReviewerAgent
//
// Reads the diff of proposed (still-pending) files for a project and flags
// incoherence — broken relative imports, obviously missing pieces — before a
// human approves them. Combines a cheap static import-resolution check
// (catches the most common failure mode: an agent importing a file another
// agent didn't create) with an LLM pass for softer issues like style drift.
// ============================================================================

import path from "path";
import { completeJson } from "../core/llm";
import type { ProjectContext } from "../core/types";
import type { ReviewIssue, ReviewResult } from "./types";
import { renderManifestForPrompt, type ProjectManifest } from "../manifest/ProjectManifest";
import { approvalQueue } from "../core/ApprovalQueue";
import type { ApprovalRequest, FileWriteAction } from "../core/types";

type FileWriteRequest = ApprovalRequest & { action: FileWriteAction };

const SYSTEM_PROMPT =
    "You are the Reviewer on a small AI engineering team. You read a set of newly proposed files (not yet " +
    "written to disk) alongside the existing project manifest, and flag genuine coherence problems: imports " +
    "that reference things that don't exist, inconsistent naming/conventions between files, or a feature " +
    "that's obviously incomplete (e.g. a component used but never defined). Do not flag stylistic preferences " +
    "or nitpicks — only report issues that would actually break the build or confuse a developer.";

interface ReviewResponse {
    issues: { relativePath: string; severity: "error" | "warning"; message: string }[];
}

const RELATIVE_IMPORT_RE = /(?:from\s+|require\(\s*|import\()\s*["'](\.[^"']+)["']/g;
const TEXT_FILE_RE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

export class ReviewerAgent {
    readonly id = "reviewer";
    readonly label = "Reviewer";
    readonly agentPath = "reviewer";

    /**
     * Reviews the pending file-write proposals identified by requestIds
     * (typically everything a single Implementer/Scaffolder call produced)
     * against the current manifest.
     */
    async review(ctx: ProjectContext, requestIds: string[], manifest: ProjectManifest): Promise<ReviewResult> {
        const proposed = requestIds
            .map((id) => approvalQueue.get(id))
            .filter((r): r is FileWriteRequest => !!r && r.action.kind === "file_write");

        if (proposed.length === 0) {
            return { ok: true, issues: [] };
        }

        const knownPaths = new Set<string>([
            ...manifest.files.map((f) => f.relativePath),
            ...proposed.map((r) => r.action.relativePath),
        ]);

        const staticIssues = this.checkImports(proposed, knownPaths);

        const diffBlock = proposed
            .map((r) => `--- ${r.action.relativePath} (new) ---\n${r.action.newContent}`)
            .join("\n\n");

        const response = await completeJson<ReviewResponse>(
            `Project request: "${ctx.prompt}"\n\n${renderManifestForPrompt(manifest)}\n\n` +
                `Newly proposed files:\n${diffBlock}\n\n` +
                `Respond as JSON: { "issues": [{ "relativePath": string, "severity": "error"|"warning", "message": string }] } ` +
                `(empty array if nothing genuinely wrong).`,
            { systemPrompt: SYSTEM_PROMPT },
        );

        const llmIssues: ReviewIssue[] = (response.issues ?? []).map((i) => ({
            relativePath: i.relativePath,
            severity: i.severity === "error" ? "error" : "warning",
            message: i.message,
        }));

        const issues = [...staticIssues, ...llmIssues];
        return { ok: !issues.some((i) => i.severity === "error"), issues };
    }

    /** Flags relative imports in proposed source files that don't resolve to any known file. */
    private checkImports(proposed: FileWriteRequest[], knownPaths: Set<string>): ReviewIssue[] {
        const issues: ReviewIssue[] = [];

        for (const { action } of proposed) {
            if (!TEXT_FILE_RE.test(action.relativePath)) continue;

            const dir = path.posix.dirname(action.relativePath);
            for (const match of action.newContent.matchAll(RELATIVE_IMPORT_RE)) {
                const importPath = match[1];
                const resolved = path.posix.normalize(path.posix.join(dir, importPath));
                const candidates = [resolved, `${resolved}.ts`, `${resolved}.tsx`, `${resolved}/index.ts`, `${resolved}/index.tsx`];
                if (!candidates.some((c) => knownPaths.has(c))) {
                    issues.push({
                        relativePath: action.relativePath,
                        severity: "warning",
                        message: `Import "${importPath}" does not resolve to any known or proposed file.`,
                    });
                }
            }
        }

        return issues;
    }
}

export const reviewerAgent = new ReviewerAgent();
