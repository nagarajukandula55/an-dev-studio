"use client";

// ============================================================================
// AN Dev Studio — Builder
//
// The user-facing entry point to the agent hierarchy: pick a platform and a
// target folder, describe what to build, and the Global Orchestrator routes
// the work through the six core-team agents (Planner, Scaffolder,
// Implementer, Reviewer, Fixer, Deployer). Every proposed file write or
// shell command shows up below as a pending approval — nothing touches disk
// or runs until you click Approve.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AgentOrgChart } from "@/components/agents/AgentOrgChart";

type Platform = "web" | "windows" | "android" | "ios" | "macos";

interface AgentResult {
    taskId: string;
    approvalRequestIds: string[];
    summary: string;
    success: boolean;
    error?: string;
}

interface FileWriteAction {
    kind: "file_write";
    relativePath: string;
    newContent: string;
    previousContent: string;
    reason: string;
}

interface ShellCommandAction {
    kind: "shell_command";
    command: string;
    cwd: string;
    reason: string;
}

type AgentAction = FileWriteAction | ShellCommandAction;

interface ApprovalRequest {
    id: string;
    projectId: string;
    agentPath: string;
    action: AgentAction;
    status: "pending" | "approved" | "rejected" | "applied" | "failed";
    createdAt: number;
    error?: string;
}

const PLATFORMS: { id: Platform; label: string; note?: string }[] = [
    { id: "web", label: "Web" },
    { id: "windows", label: "Windows Desktop" },
    { id: "android", label: "Android", note: "requires Android SDK — proposals only until installed" },
    { id: "ios", label: "iOS", note: "requires macOS + Xcode — cannot build from Windows" },
    { id: "macos", label: "macOS", note: "requires macOS + Xcode — cannot build from Windows" },
];

export default function BuilderPage() {
    const [platform, setPlatform] = useState<Platform>("web");
    const [targetFolder, setTargetFolder] = useState("");
    const [prompt, setPrompt] = useState("");
    const [running, setRunning] = useState(false);
    const [projectId, setProjectId] = useState<string | null>(null);
    const [rationale, setRationale] = useState<string | null>(null);
    const [results, setResults] = useState<AgentResult[]>([]);
    const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

    const refreshApprovals = useCallback((pid: string) => {
        fetch(`/api/agents/approvals?projectId=${encodeURIComponent(pid)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data: { approvals: ApprovalRequest[] } | null) => {
                if (data) setApprovals(data.approvals);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!projectId) return;
        refreshApprovals(projectId);
        const interval = setInterval(() => refreshApprovals(projectId), 4000);
        return () => clearInterval(interval);
    }, [projectId, refreshApprovals]);

    const handleRun = useCallback(async () => {
        if (!prompt.trim() || !targetFolder.trim()) {
            setError("Enter both a target folder and what to build.");
            return;
        }
        setRunning(true);
        setError(null);
        setResults([]);
        try {
            const res = await fetch("/api/agents/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, platform, targetFolder }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Orchestration failed");
                return;
            }
            setProjectId(data.projectId);
            setRationale(data.plan?.rationale ?? null);
            setResults(data.results ?? []);
            refreshApprovals(data.projectId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Network error");
        } finally {
            setRunning(false);
        }
    }, [prompt, platform, targetFolder, refreshApprovals]);

    const handleDecision = useCallback(
        async (id: string, decision: "approve" | "reject") => {
            setBusyIds((prev) => new Set(prev).add(id));
            try {
                await fetch(`/api/agents/approvals/${id}/${decision}`, { method: "POST" });
                if (projectId) refreshApprovals(projectId);
            } finally {
                setBusyIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        },
        [projectId, refreshApprovals]
    );

    const pending = approvals.filter((a) => a.status === "pending");
    const resolved = approvals.filter((a) => a.status !== "pending");

    return (
        <AppShell title="Builder">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>Builder</h1>
                <p style={{ margin: 0, fontSize: 14, color: "var(--muted, #64748b)" }}>
                    Describe what to build. Every file write and command is proposed for your approval below —
                    nothing runs automatically.
                </p>
            </div>

            <AgentOrgChart />

            <Card style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
                            Platform
                        </label>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {PLATFORMS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setPlatform(p.id)}
                                    title={p.note}
                                    style={{
                                        padding: "8px 14px",
                                        borderRadius: 8,
                                        border: platform === p.id ? "1.5px solid #6366f1" : "1.5px solid var(--border, #e2e8f0)",
                                        background: platform === p.id ? "#6366f115" : "transparent",
                                        color: platform === p.id ? "#6366f1" : "var(--foreground, #0f172a)",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    {p.label}
                                    {p.note ? " ⚠️" : ""}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
                            Target folder (absolute path on this machine)
                        </label>
                        <Input
                            value={targetFolder}
                            onChange={(e) => setTargetFolder(e.target.value)}
                            placeholder="D:\Development\my-new-app"
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
                            What do you want to build?
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={3}
                            placeholder="e.g. a todo app with a REST API and a Postgres schema"
                            style={{
                                width: "100%",
                                padding: 12,
                                borderRadius: 8,
                                border: "1.5px solid var(--border, #e2e8f0)",
                                background: "var(--background, #f8fafc)",
                                fontSize: 13,
                                fontFamily: "inherit",
                                resize: "vertical",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div>
                        <Button variant="primary" onClick={() => void handleRun()} loading={running}>
                            {running ? "Planning…" : "Build"}
                        </Button>
                    </div>

                    {error && <div style={{ color: "#dc2626", fontSize: 13 }}>{error}</div>}
                </div>
            </Card>

            {rationale && (
                <Card style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Plan</div>
                    <div style={{ fontSize: 13, color: "var(--muted, #64748b)", lineHeight: 1.6 }}>{rationale}</div>
                    {results.length > 0 && (
                        <ul style={{ marginTop: 10, paddingLeft: 18, fontSize: 13 }}>
                            {results.map((r, i) => (
                                <li key={i} style={{ color: r.success ? "var(--foreground, #0f172a)" : "#dc2626" }}>
                                    {r.summary}
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}

            {pending.length > 0 && (
                <Card style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                        Pending approval ({pending.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {pending.map((a) => (
                            <ApprovalCard
                                key={a.id}
                                approval={a}
                                busy={busyIds.has(a.id)}
                                onApprove={() => void handleDecision(a.id, "approve")}
                                onReject={() => void handleDecision(a.id, "reject")}
                            />
                        ))}
                    </div>
                </Card>
            )}

            {resolved.length > 0 && (
                <Card>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>History</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {resolved.map((a) => (
                            <div key={a.id} style={{ fontSize: 12, color: "var(--muted, #64748b)" }}>
                                <StatusBadge status={a.status} /> {a.agentPath} —{" "}
                                {a.action.kind === "file_write" ? a.action.relativePath : a.action.command}
                                {a.error && <span style={{ color: "#dc2626" }}> ({a.error})</span>}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </AppShell>
    );
}

function StatusBadge({ status }: { status: ApprovalRequest["status"] }) {
    const colors: Record<ApprovalRequest["status"], string> = {
        pending: "#f59e0b",
        approved: "#6366f1",
        rejected: "#94a3b8",
        applied: "#22c55e",
        failed: "#dc2626",
    };
    return (
        <span
            style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: colors[status],
                marginRight: 6,
            }}
        />
    );
}

function ApprovalCard({
    approval,
    busy,
    onApprove,
    onReject,
}: {
    approval: ApprovalRequest;
    busy: boolean;
    onApprove: () => void;
    onReject: () => void;
}) {
    const { action } = approval;
    return (
        <div style={{ border: "1.5px solid var(--border, #e2e8f0)", borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted, #64748b)" }}>{approval.agentPath}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {action.kind === "file_write" ? action.relativePath : "Shell command"}
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="secondary" size="sm" onClick={onReject} disabled={busy}>
                        Reject
                    </Button>
                    <Button variant="primary" size="sm" onClick={onApprove} disabled={busy}>
                        {busy ? "…" : "Approve"}
                    </Button>
                </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted, #64748b)", marginBottom: 8 }}>{action.reason}</div>
            {action.kind === "file_write" ? (
                <pre
                    style={{
                        background: "#0f172a",
                        color: "#e2e8f0",
                        padding: 12,
                        borderRadius: 8,
                        fontSize: 12,
                        overflowX: "auto",
                        maxHeight: 300,
                        margin: 0,
                    }}
                >
                    {action.newContent}
                </pre>
            ) : (
                <pre
                    style={{
                        background: "#0f172a",
                        color: "#86efac",
                        padding: 12,
                        borderRadius: 8,
                        fontSize: 12,
                        margin: 0,
                    }}
                >
                    $ {action.command}
                </pre>
            )}
        </div>
    );
}
