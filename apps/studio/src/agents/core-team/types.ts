// ============================================================================
// AN Dev Studio — Core Team Types
//
// Shared shapes for the six context-aware agents (Planner, Scaffolder,
// Implementer, Reviewer, Fixer, Deployer). Unlike the old micro-agents (one
// file per call), these agents can propose several files per call — they
// always see the shared ProjectManifest so multi-file output stays coherent.
// ============================================================================

import type { ProjectContext } from "../core/types";
import type { ProjectManifest } from "../manifest/ProjectManifest";

export interface Feature {
    id: string;
    title: string;
    description: string;
    /** Relative file paths this feature is expected to touch — feeds manifest focus + review scope. */
    files: string[];
}

export interface BuildPlan {
    rationale: string;
    /** Scaffold-level notes (framework, key deps) the Scaffolder should act on. */
    scaffoldNotes: string;
    features: Feature[];
}

export interface FileProposalSpec {
    relativePath: string;
    content: string;
    reason: string;
}

export interface ReviewIssue {
    relativePath: string;
    severity: "error" | "warning";
    message: string;
}

export interface ReviewResult {
    ok: boolean;
    issues: ReviewIssue[];
}

export interface CoreTeamContext {
    ctx: ProjectContext;
    manifest: ProjectManifest;
}
