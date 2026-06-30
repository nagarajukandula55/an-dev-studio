/**
 * ============================================================================
 * AN Dev Studio — Workspace Module
 * ============================================================================
 */

"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge }    from "@/components/ui/Badge";
import { Button }   from "@/components/ui/Button";

const SAMPLE_FILES = [
    { path: "src/core/kernel/StudioKernel.ts",     size: "3.2 KB", modified: "2m ago",  language: "ts" },
    { path: "src/core/container/ServiceContainer.ts", size: "5.1 KB", modified: "1h ago",  language: "ts" },
    { path: "src/agents/impl/ArchitectAgent.ts",    size: "2.8 KB", modified: "3h ago",  language: "ts" },
    { path: "src/agents/impl/DeveloperAgent.ts",    size: "2.1 KB", modified: "3h ago",  language: "ts" },
    { path: "packages/ai-core/src/providers/AnthropicProvider.ts", size: "4.7 KB", modified: "5h ago", language: "ts" },
    { path: "apps/studio/src/app/page.tsx",         size: "6.3 KB", modified: "Just now", language: "tsx" },
];

const SAMPLE_CODE = `/**
 * StudioKernel — Core initialization
 */
import { ServiceContainer } from "@/core/container/ServiceContainer";
import { ServiceTokens }    from "@/core/container/ServiceTokens";
import { Logger }           from "@/core/logging/Logger";
import { EventBus }         from "@/core/events/EventBus";

export class StudioKernel {
    private static instance: StudioKernel | null = null;
    private readonly log = Logger.forContext("StudioKernel");

    private constructor() {}

    static getInstance(): StudioKernel {
        if (!StudioKernel.instance) {
            StudioKernel.instance = new StudioKernel();
        }
        return StudioKernel.instance;
    }

    async boot(): Promise<void> {
        this.log.info("Booting AN Dev Studio kernel…");
        // Phase 1: Register core services
        await this.registerServices();
        // Phase 2: Initialize modules
        await this.initializeModules();
        // Phase 3: Emit ready event
        const bus = ServiceContainer.resolve(ServiceTokens.EVENT_BUS);
        bus.emit({ type: "system.ready", payload: { ts: Date.now() } });
        this.log.info("Kernel boot complete");
    }
}`;

const LANG_COLOR: Record<string, string> = {
    ts:  "#3178c6",
    tsx: "#61dafb",
    js:  "#f7df1e",
    py:  "#3572a5",
    go:  "#00add8",
};

export default function WorkspacePage() {
    const [selectedFile, setSelectedFile] = useState(SAMPLE_FILES[0].path);

    return (
        <AppShell title="Workspace">
            <div style={{
                display: "grid",
                gridTemplateColumns: "280px 1fr",
                gap: "16px",
                height: "calc(100dvh - var(--topbar-height) - 48px)",
                minHeight: 0,
            }}>
                {/* File tree panel */}
                <div style={{
                    display:      "flex",
                    flexDirection: "column",
                    background:   "var(--color-bg-surface)",
                    border:       "1px solid var(--color-border)",
                    borderRadius: "12px",
                    overflow:     "hidden",
                }}>
                    <div style={{
                        padding:     "12px 14px",
                        borderBottom: "1px solid var(--color-border)",
                        fontWeight:  600,
                        fontSize:    "13px",
                        color:       "var(--color-text)",
                        display:     "flex",
                        alignItems:  "center",
                        justifyContent: "space-between",
                    }}>
                        <span>Explorer</span>
                        <Badge variant="default">{SAMPLE_FILES.length}</Badge>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
                        {SAMPLE_FILES.map(file => (
                            <button
                                key={file.path}
                                onClick={() => setSelectedFile(file.path)}
                                style={{
                                    display:     "flex",
                                    alignItems:  "center",
                                    gap:         "8px",
                                    width:       "100%",
                                    padding:     "7px 8px",
                                    borderRadius: "6px",
                                    border:      "none",
                                    cursor:      "pointer",
                                    background:  selectedFile === file.path
                                        ? "color-mix(in srgb, var(--color-accent) 10%, transparent)"
                                        : "transparent",
                                    textAlign:   "left",
                                    transition:  "background 0.1s",
                                }}
                            >
                                <span style={{
                                    fontSize:     "10px",
                                    fontWeight:   700,
                                    padding:      "1px 4px",
                                    borderRadius: "4px",
                                    background:   LANG_COLOR[file.language] ?? "#6b7280",
                                    color:        "#fff",
                                    flexShrink:   0,
                                }}>
                                    {file.language.toUpperCase()}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize:    "12.5px",
                                        color:       selectedFile === file.path
                                            ? "var(--color-accent)"
                                            : "var(--color-text)",
                                        fontWeight:  selectedFile === file.path ? 500 : 400,
                                        overflow:    "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace:  "nowrap",
                                    }}>
                                        {file.path.split("/").pop()}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                        {file.modified} · {file.size}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code editor panel */}
                <div style={{
                    display:      "flex",
                    flexDirection: "column",
                    background:   "var(--color-bg-surface)",
                    border:       "1px solid var(--color-border)",
                    borderRadius: "12px",
                    overflow:     "hidden",
                }}>
                    {/* File tab */}
                    <div style={{
                        padding:     "0 16px",
                        borderBottom: "1px solid var(--color-border)",
                        display:     "flex",
                        alignItems:  "center",
                        gap:         "12px",
                        height:      "40px",
                        flexShrink:  0,
                    }}>
                        <span style={{
                            fontSize:  "12.5px",
                            color:     "var(--color-text)",
                            fontWeight: 500,
                            borderBottom: "2px solid var(--color-accent)",
                            paddingBottom: "2px",
                        }}>
                            {selectedFile.split("/").pop()}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--color-text-muted)", marginLeft: "auto" }}>
                            {SAMPLE_FILES.find(f => f.path === selectedFile)?.size}
                        </span>
                    </div>

                    {/* Code view */}
                    <div style={{
                        flex:       1,
                        overflowY:  "auto",
                        padding:    "16px",
                        background: "var(--color-bg)",
                    }}>
                        <pre style={{
                            margin:   0,
                            fontSize: "12.5px",
                            color:    "var(--color-text)",
                            fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                            lineHeight: 1.7,
                            whiteSpace: "pre",
                            overflowX: "auto",
                        }}>
                            <code>{SAMPLE_CODE}</code>
                        </pre>
                    </div>

                    {/* Status bar */}
                    <div style={{
                        padding:     "6px 16px",
                        borderTop:   "1px solid var(--color-border)",
                        display:     "flex",
                        alignItems:  "center",
                        gap:         "16px",
                        flexShrink:  0,
                        background:  "var(--color-bg-subtle)",
                    }}>
                        <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)" }}>TypeScript</span>
                        <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)" }}>UTF-8</span>
                        <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)" }}>LF</span>
                        <span style={{ marginLeft: "auto", fontSize: "11.5px", color: "var(--color-text-muted)" }}>
                            AN Dev Studio Workspace
                        </span>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
