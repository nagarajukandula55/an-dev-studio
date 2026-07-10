// ============================================================================
// AN Dev Studio — Auto-Approve Toggle (per project)
//
// Default OFF: BuildVerifier proposes verify-loop commands/fixes through the
// same ApprovalQueue as every other agent action, and by default they sit
// pending for a human to click Approve, same as any other proposal. Turning
// this on for a project lets BuildVerifier call approveAndApply() on its own
// proposals so the fix-loop can iterate without a human in the loop each
// time — still the same single choke point, just auto-driven.
// ============================================================================

class AutoApproveStoreImpl {
    private enabled = new Map<string, boolean>();

    get(projectId: string): boolean {
        return this.enabled.get(projectId) ?? false;
    }

    set(projectId: string, value: boolean): void {
        this.enabled.set(projectId, value);
    }
}

declare global {
    // eslint-disable-next-line no-var
    var __anDevStudioAutoApproveStore: AutoApproveStoreImpl | undefined;
}

export const autoApproveStore: AutoApproveStoreImpl =
    globalThis.__anDevStudioAutoApproveStore ?? (globalThis.__anDevStudioAutoApproveStore = new AutoApproveStoreImpl());
