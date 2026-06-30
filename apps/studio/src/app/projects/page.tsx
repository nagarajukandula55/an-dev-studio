/**
 * ============================================================================
 * AN Dev Studio — Projects Module
 * ============================================================================
 */

"use client";

import React, { useState } from "react";
import { AppShell }  from "@/components/layout/AppShell";
import { Card }      from "@/components/ui/Card";
import { Button }    from "@/components/ui/Button";
import { Badge }     from "@/components/ui/Badge";
import { Input }     from "@/components/ui/Input";

interface Project {
    id:          string;
    name:        string;
    description: string;
    language:    string;
    status:      "active" | "paused" | "archived";
    lastUpdated: string;
    agents:      number;
}

const MOCK_PROJECTS: Project[] = [
    {
        id:          "p1",
        name:        "api-gateway",
        description: "High-performance API gateway with rate limiting and auth",
        language:    "TypeScript",
        status:      "active",
        lastUpdated: "2 hours ago",
        agents:      3,
    },
    {
        id:          "p2",
        name:        "auth-service",
        description: "OAuth2 + JWT authentication microservice",
        language:    "TypeScript",
        status:      "active",
        lastUpdated: "Yesterday",
        agents:      2,
    },
    {
        id:          "p3",
        name:        "data-pipeline",
        description: "Streaming data ingestion and transformation pipeline",
        language:    "Python",
        status:      "paused",
        lastUpdated: "3 days ago",
        agents:      0,
    },
    {
        id:          "p4",
        name:        "mobile-app",
        description: "React Native cross-platform mobile application",
        language:    "TypeScript",
        status:      "active",
        lastUpdated: "5 hours ago",
        agents:      4,
    },
    {
        id:          "p5",
        name:        "ml-inference",
        description: "Model inference server with auto-scaling",
        language:    "Python",
        status:      "archived",
        lastUpdated: "2 weeks ago",
        agents:      0,
    },
];

const STATUS_BADGE: Record<Project["status"], "success"|"warning"|"default"> = {
    active:   "success",
    paused:   "warning",
    archived: "default",
};

const LANG_COLOR: Record<string, string> = {
    TypeScript: "#3b82f6",
    Python:     "#f59e0b",
    Go:         "#10b981",
    Rust:       "#f97316",
};

export default function ProjectsPage() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all"|Project["status"]>("all");

    const filtered = MOCK_PROJECTS.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                            p.description.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || p.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <AppShell title="Projects">
            {/* Toolbar */}
            <div style={{
                display:       "flex",
                alignItems:    "center",
                gap:           "12px",
                marginBottom:  "20px",
                flexWrap:      "wrap",
            }}>
                <div style={{ flex: 1, minWidth: "200px", maxWidth: "320px" }}>
                    <Input
                        placeholder="Search projects…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        prefixIcon={<SearchIcon />}
                    />
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                    {(["all", "active", "paused", "archived"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding:      "6px 12px",
                                borderRadius: "7px",
                                fontSize:     "12.5px",
                                fontWeight:   500,
                                border:       "1px solid var(--color-border)",
                                cursor:       "pointer",
                                background:   filter === f ? "var(--color-accent)" : "var(--color-bg-surface)",
                                color:        filter === f ? "#fff" : "var(--color-text-muted)",
                                transition:   "all 0.12s ease",
                                textTransform: "capitalize",
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <Button variant="primary" icon={<PlusIcon />}>
                    New Project
                </Button>
            </div>

            {/* Project grid */}
            <div style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap:                 "16px",
            }}>
                {filtered.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))}
                {filtered.length === 0 && (
                    <div style={{
                        gridColumn: "1 / -1",
                        textAlign:  "center",
                        padding:    "60px 0",
                        color:      "var(--color-text-muted)",
                        fontSize:   "14px",
                    }}>
                        No projects match your search.
                    </div>
                )}
            </div>
        </AppShell>
    );
}

// ---------------------------------------------------------------------------

function ProjectCard({ project }: { project: Project }) {
    return (
        <Card hoverable style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{
                    width:        "38px",
                    height:       "38px",
                    borderRadius: "9px",
                    background:   "var(--color-bg-subtle)",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    flexShrink:   0,
                    fontSize:     "16px",
                }}>
                    📁
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontWeight: 600,
                        fontSize:   "14px",
                        color:      "var(--color-text)",
                        overflow:   "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        {project.name}
                    </div>
                    <div style={{
                        fontSize:   "12.5px",
                        color:      "var(--color-text-muted)",
                        marginTop:  "2px",
                        overflow:   "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        {project.description}
                    </div>
                </div>
                <Badge variant={STATUS_BADGE[project.status]}>{project.status}</Badge>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                    display:      "inline-flex",
                    alignItems:   "center",
                    gap:          "5px",
                    fontSize:     "12px",
                    color:        "var(--color-text-muted)",
                }}>
                    <span style={{
                        width:        "8px",
                        height:       "8px",
                        borderRadius: "50%",
                        background:   LANG_COLOR[project.language] ?? "#6b7280",
                        flexShrink:   0,
                    }} />
                    {project.language}
                </span>

                {project.agents > 0 && (
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                        · {project.agents} agents active
                    </span>
                )}

                <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--color-text-muted)" }}>
                    {project.lastUpdated}
                </span>
            </div>
        </Card>
    );
}

function SearchIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    );
}
