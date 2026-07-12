// ============================================================================
// AN Dev Studio — Auto-Approve Toggle (per project)
//
// Default OFF: BuildVerifier proposes verify-loop commands/fixes through the
// same ApprovalQueue as every other agent action, and by default they sit
// pending for a human to click Approve, same as any other proposal. Turning
// this on for a project lets BuildVerifier call approveAndApply() on its own
// proposals so the fix-loop can iterate without a human in the loop each
// time — still the same single choke point, just auto-driven.
//
// Backed by SQLite (the projects table's auto_approve column) since
// Phase 4 — survives a server restart, same as everything else.
// ============================================================================

import { getAutoApprove, setAutoApprove } from "@/lib/db/projectsRepo";

class AutoApproveStoreImpl {
    get(projectId: string): boolean {
        return getAutoApprove(projectId);
    }

    set(projectId: string, value: boolean): void {
        setAutoApprove(projectId, value);
    }
}

export const autoApproveStore = new AutoApproveStoreImpl();
