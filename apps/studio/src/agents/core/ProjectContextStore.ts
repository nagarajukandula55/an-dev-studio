// ============================================================================
// AN Dev Studio — Project Context Store
//
// In-memory lookup from projectId -> ProjectContext, populated whenever
// GlobalOrchestrator.run() starts a build. Lets /api/agents/verify (and
// BuildVerifier) reconstruct the ProjectContext for a project without the
// caller having to resend targetFolder/platform/prompt on every request.
//
// Same in-memory/globalThis singleton pattern as ApprovalQueue — process-
// lifetime only. Phase 4 replaces this with the SQLite projects table.
// ============================================================================

import type { ProjectContext } from "./types";

class ProjectContextStoreImpl {
    private contexts = new Map<string, ProjectContext>();

    set(ctx: ProjectContext): void {
        this.contexts.set(ctx.projectId, ctx);
    }

    get(projectId: string): ProjectContext | undefined {
        return this.contexts.get(projectId);
    }
}

declare global {
    // eslint-disable-next-line no-var
    var __anDevStudioProjectContextStore: ProjectContextStoreImpl | undefined;
}

export const projectContextStore: ProjectContextStoreImpl =
    globalThis.__anDevStudioProjectContextStore ??
    (globalThis.__anDevStudioProjectContextStore = new ProjectContextStoreImpl());
