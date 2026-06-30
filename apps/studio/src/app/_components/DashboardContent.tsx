"use client";

import { AppShell }         from "@/components/layout/AppShell";
import { StatCard }          from "@/components/ui/StatCard";
import { Card, CardHeader }  from "@/components/ui/Card";
import { Badge }             from "@/components/ui/Badge";

const STATS = [
    {
        label: "Active Projects",
        value: 12,
        color: "#3b66ff",
        icon:  (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
        ),
        trend: { value: "3 this week", positive: true },
    },
    {
        label: "AI Tasks Run",
        value: "1,483",
        color: "#8b5cf6",
        icon:  (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
            </svg>
        ),
        trend: { value: "12% vs last week", positive: true },
    },
    {
        label: "Tests Generated",
        value: 348,
        color: "#10b981",
        icon:  (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        ),
        trend: { value: "94% pass rate", positive: true },
    },
    {
        label: "Code Reviews",
        value: 57,
        color: "#f59e0b",
        icon:  (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
            </svg>
        ),
        trend: { value: "8 pending", positive: false },
    },
];

const RECENT_ACTIVITY = [
    { id: 1, message: "ArchitectAgent completed system design for ProjectX",    time: "2m ago",  status: "success" as const },
    { id: 2, message: "DeveloperAgent generated 14 files for auth module",       time: "15m ago", status: "success" as const },
    { id: 3, message: "QAAgent created 28 Vitest tests for api-gateway",         time: "1h ago",  status: "success" as const },
    { id: 4, message: "ReviewerAgent found 3 critical issues in payments-svc",   time: "2h ago",  status: "warning" as const },
    { id: 5, message: "DevOpsAgent generated Docker + CI/CD pipeline config",    time: "3h ago",  status: "success" as const },
];

const STATUS_COLOR: Record<"success" | "warning" | "danger", string> = {
    success: "#10b981",
    warning: "#f59e0b",
    danger:  "#ef4444",
};

function AgentStatusList() {
    const agents = [
        { name: "Architect",    status: "idle"   as const },
        { name: "Planner",      status: "idle"   as const },
        { name: "Developer",    status: "active" as const },
        { name: "QA",           status: "idle"   as const },
        { name: "Reviewer",     status: "active" as const },
        { name: "DevOps",       status: "idle"   as const },
        { name: "Orchestrator", status: "active" as const },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {agents.map(agent => (
                <div
                    key={agent.name}
                    style={{
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "space-between",
                        padding:        "7px 10px",
                        borderRadius:   "8px",
                        background:     "var(--color-bg-subtle)",
                    }}
                >
                    <span style={{ fontSize: "13px", color: "var(--color-text)", fontWeight: 500 }}>
                        {agent.name}
                    </span>
                    <Badge variant={agent.status === "active" ? "success" : "default"} dot>
                        {agent.status}
                    </Badge>
                </div>
            ))}
        </div>
    );
}

export default function DashboardContent() {
    return (
        <AppShell title="Dashboard">
            {/* Header row */}
            <div style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                marginBottom:   "24px",
                flexWrap:       "wrap",
                gap:            "12px",
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--color-text)" }}>
                        Good morning 👋
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "var(--color-text-muted)" }}>
                        Here&apos;s what&apos;s happening with your projects.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    {[
                        { label: "New Project", href: "/projects" },
                        { label: "AI Studio",   href: "/ai"       },
                    ].map((a, i) => (
                        <a
                            key={a.href}
                            href={a.href}
                            style={{
                                display:        "inline-flex",
                                alignItems:     "center",
                                padding:        "7px 14px",
                                borderRadius:   "8px",
                                fontSize:       "13.5px",
                                fontWeight:     500,
                                textDecoration: "none",
                                background:     i === 0 ? "var(--color-accent)" : "var(--color-bg-surface)",
                                color:          i === 0 ? "#fff" : "var(--color-text)",
                                border:         `1px solid ${i === 0 ? "transparent" : "var(--color-border)"}`,
                            }}
                        >
                            {a.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Stats grid */}
            <div style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap:                 "16px",
                marginBottom:        "24px",
            }}>
                {STATS.map(s => (
                    <StatCard key={s.label} {...s} />
                ))}
            </div>

            {/* Two-column section */}
            <div style={{
                display:             "grid",
                gridTemplateColumns: "1fr 300px",
                gap:                 "16px",
                alignItems:          "start",
            }}>
                {/* Recent activity */}
                <Card>
                    <CardHeader
                        title="Recent Activity"
                        subtitle="Last 24 hours across all agents"
                        action={<Badge variant="accent">Live</Badge>}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {RECENT_ACTIVITY.map((item, i) => (
                            <div
                                key={item.id}
                                style={{
                                    display:      "flex",
                                    alignItems:   "center",
                                    gap:          "12px",
                                    padding:      "10px 0",
                                    borderBottom: i < RECENT_ACTIVITY.length - 1
                                        ? "1px solid var(--color-border)"
                                        : "none",
                                }}
                            >
                                <span style={{
                                    width:        "8px",
                                    height:       "8px",
                                    borderRadius: "50%",
                                    background:   STATUS_COLOR[item.status],
                                    flexShrink:   0,
                                }} />
                                <span style={{
                                    flex:         1,
                                    fontSize:     "13px",
                                    color:        "var(--color-text)",
                                    minWidth:     0,
                                    overflow:     "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace:   "nowrap",
                                }}>
                                    {item.message}
                                </span>
                                <span style={{ fontSize: "12px", color: "var(--color-text-muted)", flexShrink: 0 }}>
                                    {item.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Agent status */}
                <Card>
                    <CardHeader title="Agent Status" subtitle="Multi-agent system health" />
                    <AgentStatusList />
                </Card>
            </div>
        </AppShell>
    );
}
