"use client";

// ============================================================================
// AN Dev Studio — Agent Org Chart
//
// Live view of the whole agent hierarchy: Global Orchestrator at the top,
// one row per Mini-Orchestrator (UI, Backend, Database, Testing, DevOps,
// Marketing, Automation, and each platform), each expandable to show its own
// Micro-Agents underneath. Polls /api/agents/status so this reflects what's
// actually running right now, not a static roster.
// ============================================================================

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";

type AgentRunState = "idle" | "planning" | "running" | "success" | "error";

interface AgentStatusEntry {
    id: string;
    label: string;
    kind: "global" | "mini" | "micro";
    parentId?: string;
    state: AgentRunState;
    lastMessage?: string;
    lastUpdated: number;
    currentProjectId?: string;
}

interface StatusResponse {
    global?: AgentStatusEntry;
    minis: AgentStatusEntry[];
    micros: AgentStatusEntry[];
}

const STATE_COLOR: Record<AgentRunState, string> = {
    idle: "#94a3b8",
    planning: "#f59e0b",
    running: "#6366f1",
    success: "#22c55e",
    error: "#ef4444",
};

const STATE_LABEL: Record<AgentRunState, string> = {
    idle: "Idle",
    planning: "Planning",
    running: "Running",
    success: "Success",
    error: "Error",
};

function StatusDot({ state }: { state: AgentRunState }) {
    return (
        <span
            aria-hidden="true"
            style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: STATE_COLOR[state],
                flexShrink: 0,
                boxShadow: state === "running" || state === "planning" ? `0 0 0 3px ${STATE_COLOR[state]}33` : "none",
                animation: state === "running" || state === "planning" ? "pulse-dot 1.4s ease-in-out infinite" : "none",
            }}
        />
    );
}

export function AgentOrgChart() {
    const [data, setData] = useState<StatusResponse | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    const fetchStatus = useCallback(() => {
        fetch("/api/agents/status")
            .then((r) => (r.ok ? r.json() : null))
            .then((d: StatusResponse | null) => {
                if (d) setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 4000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    if (loading) {
        return (
            <Card style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "var(--muted, #64748b)" }}>Loading agent org chart…</div>
            </Card>
        );
    }

    if (!data || !data.global) {
        return null;
    }

    const microsByMini = (miniId: string) => data.micros.filter((m) => m.parentId === miniId);

    const activeCount = [...data.minis, ...data.micros].filter(
        (a) => a.state === "running" || a.state === "planning"
    ).length;

    return (
        <Card style={{ marginBottom: 20 }}>
            <style>{`
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Agent Org Chart</div>
                <div style={{ fontSize: 12, color: "var(--muted, #64748b)" }}>
                    {activeCount > 0 ? `${activeCount} agent(s) active` : `${data.minis.length} mini-orchestrators · ${data.micros.length} micro-agents`}
                </div>
            </div>

            {/* Global Orchestrator */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "var(--color-surface-2, #f1f5f9)",
                    marginBottom: 10,
                }}
            >
                <StatusDot state={data.global.state} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{data.global.label}</div>
                    {data.global.lastMessage && (
                        <div style={{ fontSize: 11, color: "var(--muted, #64748b)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {data.global.lastMessage}
                        </div>
                    )}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: STATE_COLOR[data.global.state] }}>
                    {STATE_LABEL[data.global.state]}
                </span>
            </div>

            {/* Mini-orchestrators */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 18, borderLeft: "2px solid var(--color-border, #e2e8f0)", marginLeft: 8 }}>
                {data.minis.map((mini) => {
                    const micros = microsByMini(mini.id);
                    const isOpen = !!expanded[mini.id];
                    return (
                        <div key={mini.id}>
                            <div
                                onClick={() => setExpanded((prev) => ({ ...prev, [mini.id]: !prev[mini.id] }))}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    background: isOpen ? "var(--color-surface-2, #f1f5f9)" : "transparent",
                                }}
                            >
                                <span style={{ fontSize: 10, color: "var(--muted, #94a3b8)", width: 10, textAlign: "center" }}>
                                    {isOpen ? "▾" : "▸"}
                                </span>
                                <StatusDot state={mini.state} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{mini.label}</div>
                                </div>
                                <span style={{ fontSize: 10.5, color: "var(--muted, #94a3b8)" }}>
                                    {micros.length} agent{micros.length === 1 ? "" : "s"}
                                </span>
                                <span style={{ fontSize: 10.5, fontWeight: 600, color: STATE_COLOR[mini.state] }}>
                                    {STATE_LABEL[mini.state]}
                                </span>
                            </div>

                            {isOpen && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingLeft: 34, marginTop: 3, marginBottom: 6 }}>
                                    {micros.length === 0 ? (
                                        <div style={{ fontSize: 11.5, color: "var(--muted, #94a3b8)", padding: "4px 0" }}>
                                            No micro-agents registered yet.
                                        </div>
                                    ) : (
                                        micros.map((micro) => (
                                            <div
                                                key={micro.id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    padding: "5px 10px",
                                                    borderRadius: 6,
                                                }}
                                            >
                                                <StatusDot state={micro.state} />
                                                <div style={{ flex: 1, minWidth: 0, fontSize: 11.5 }}>
                                                    {micro.label}
                                                    {micro.lastMessage && (
                                                        <span style={{ color: "var(--muted, #94a3b8)" }}>
                                                            {" "}— {micro.lastMessage}
                                                        </span>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: 10, fontWeight: 600, color: STATE_COLOR[micro.state], flexShrink: 0 }}>
                                                    {STATE_LABEL[micro.state]}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
