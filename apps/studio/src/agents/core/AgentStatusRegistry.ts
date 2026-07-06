// ============================================================================
// AN Dev Studio — Agent Status Registry
//
// Live, in-memory status for the whole org chart: the Global Orchestrator,
// every Mini-Orchestrator, and every Micro-Agent underneath it. The Builder
// dashboard polls this (via /api/agents/status) to render a real org-chart
// view with live state — not a static list, an actual reflection of what's
// running right now.
//
// Same in-memory/globalThis singleton pattern as ApprovalQueue: survives
// Next.js dev hot-reload, resets on a real server restart (fine for a
// single-user local desktop app).
// ============================================================================

export type AgentRunState = "idle" | "planning" | "running" | "success" | "error";

export interface AgentStatusEntry {
    id: string;              // e.g. "ui" or "ui.component-builder" or "global"
    label: string;
    kind: "global" | "mini" | "micro";
    parentId?: string;       // mini's parent is "global"; micro's parent is its mini's id
    state: AgentRunState;
    lastMessage?: string;
    lastUpdated: number;
    currentProjectId?: string;
}

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // prune entries idle for a full day

class AgentStatusRegistryImpl {
    private entries = new Map<string, AgentStatusEntry>();

    /** Called once at startup (or lazily on first use) to seed every known agent as "idle". */
    register(id: string, label: string, kind: AgentStatusEntry["kind"], parentId?: string): void {
        if (this.entries.has(id)) return;
        this.entries.set(id, {
            id,
            label,
            kind,
            parentId,
            state: "idle",
            lastUpdated: Date.now(),
        });
    }

    update(id: string, patch: Partial<Pick<AgentStatusEntry, "state" | "lastMessage" | "currentProjectId">>): void {
        const existing = this.entries.get(id);
        if (!existing) return; // silently ignore updates for unregistered ids rather than throwing
        Object.assign(existing, patch, { lastUpdated: Date.now() });
    }

    list(): AgentStatusEntry[] {
        this.prune();
        return [...this.entries.values()].sort((a, b) => a.id.localeCompare(b.id));
    }

    private prune(): void {
        const now = Date.now();
        for (const [id, entry] of this.entries) {
            if (entry.state === "idle" && now - entry.lastUpdated > MAX_AGE_MS) {
                this.entries.delete(id);
            }
        }
    }
}

declare global {
    // eslint-disable-next-line no-var
    var __anDevStudioAgentStatusRegistry: AgentStatusRegistryImpl | undefined;
}

export const agentStatusRegistry: AgentStatusRegistryImpl =
    globalThis.__anDevStudioAgentStatusRegistry ??
    (globalThis.__anDevStudioAgentStatusRegistry = new AgentStatusRegistryImpl());
