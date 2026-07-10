// ============================================================================
// AN Dev Studio — Project Context Store
//
// projectId -> ProjectContext lookup, populated whenever
// GlobalOrchestrator.run() starts a build. Lets /api/agents/verify (and
// BuildVerifier) reconstruct the ProjectContext for a project without the
// caller having to resend targetFolder/platform/prompt on every request.
//
// Backed by SQLite (lib/db/projectsRepo.ts) since Phase 4 — survives a
// server restart. Public interface unchanged from the in-memory version.
// ============================================================================

import type { ProjectContext } from "./types";
import { getProjectContext, upsertProjectContext } from "@/lib/db/projectsRepo";

class ProjectContextStoreImpl {
    set(ctx: ProjectContext): void {
        upsertProjectContext(ctx);
    }

    get(projectId: string): ProjectContext | undefined {
        return getProjectContext(projectId);
    }
}

export const projectContextStore = new ProjectContextStoreImpl();
