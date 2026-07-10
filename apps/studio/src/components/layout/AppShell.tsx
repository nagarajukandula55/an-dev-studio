/**
 * ============================================================================
 * AN Dev Studio
 * App Shell — master layout with AnuGuide injected platform-wide
 * ============================================================================
 */

"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AnuGuide } from "../anu-guide/AnuGuide";
import { SetupWizard } from "../setup/SetupWizard";

interface AppShellProps {
    children: React.ReactNode;
    title?: string;
}

export function AppShell({ children, title }: AppShellProps) {

    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="studio-app-shell" style={{
            display:   "flex",
            height:    "100dvh",
            overflow:  "hidden",
            background: "var(--color-bg)",
        }}>

            {/* ----------------------------------------------------------------
                Sidebar
            ---------------------------------------------------------------- */}
            <Sidebar
                open={sidebarOpen}
                onToggle={() => setSidebarOpen(v => !v)}
            />

            {/* ----------------------------------------------------------------
                Main column: TopBar + content
            ---------------------------------------------------------------- */}
            <div style={{
                flex:      1,
                display:   "flex",
                flexDirection: "column",
                minWidth:  0,
                overflow:  "hidden",
            }}>

                <TopBar
                    title={title}
                    sidebarOpen={sidebarOpen}
                    onMenuClick={() => setSidebarOpen(v => !v)}
                />

                {/* Content area */}
                <main style={{
                    flex:       1,
                    overflowY:  "auto",
                    overflowX:  "hidden",
                    padding:    "24px 28px",
                }}>
                    {children}
                </main>

            </div>

            {/* ----------------------------------------------------------------
                ANu Platform Guide — floats on every page
            ---------------------------------------------------------------- */}
            <AnuGuide />

            {/* First-run experience: full-screen overlay instead of a dead
                error the first time any agent call needs a provider. */}
            <SetupWizard />

        </div>
    );
}
