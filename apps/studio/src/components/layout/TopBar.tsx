/**
 * ============================================================================
 * AN Dev Studio
 * Top Bar
 * ============================================================================
 */

"use client";

import React from "react";

interface TopBarProps {
    title?:        string;
    sidebarOpen:   boolean;
    onMenuClick:   () => void;
}

export function TopBar({ title, sidebarOpen, onMenuClick }: TopBarProps) {
    return (
        <header style={{
            height:      "var(--topbar-height)",
            display:     "flex",
            alignItems:  "center",
            padding:     "0 20px",
            borderBottom: "1px solid var(--color-border)",
            background:  "var(--color-bg-surface)",
            flexShrink:  0,
            gap:         "12px",
        }}>

            {/* Menu toggle */}
            <button
                onClick={onMenuClick}
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                style={{
                    background:  "none",
                    border:      "none",
                    cursor:      "pointer",
                    padding:     "6px",
                    borderRadius: "6px",
                    color:       "var(--color-text-muted)",
                    display:     "flex",
                    alignItems:  "center",
                    justifyContent: "center",
                    flexShrink:  0,
                    transition:  "background var(--transition-fast), color var(--transition-fast)",
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--color-bg-subtle)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)";
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "none";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
                }}
            >
                <MenuIcon />
            </button>

            {/* Page title */}
            {title && (
                <h1 style={{
                    margin:     0,
                    fontSize:   "15px",
                    fontWeight: 600,
                    color:      "var(--color-text)",
                    flex:       1,
                    overflow:   "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:  "nowrap",
                }}>
                    {title}
                </h1>
            )}
            {!title && <div style={{ flex: 1 }} />}

            {/* Right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ThemeToggle />
                <UserAvatar />
            </div>
        </header>
    );
}

// =============================================================================
// Theme Toggle
// =============================================================================

function ThemeToggle() {
    const [dark, setDark] = React.useState(() => {
        if (typeof document === "undefined") return false;
        return document.documentElement.classList.contains("dark");
    });

    function toggle() {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        try { localStorage.setItem("studio-theme", next ? "dark" : "light"); } catch { /* noop */ }
    }

    return (
        <button
            onClick={toggle}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
                background:   "none",
                border:       "none",
                cursor:       "pointer",
                padding:      "6px",
                borderRadius: "6px",
                color:        "var(--color-text-muted)",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                transition:   "background var(--transition-fast), color var(--transition-fast)",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--color-bg-subtle)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "none";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
            }}
        >
            {dark ? <SunIcon /> : <MoonIcon />}
        </button>
    );
}

// =============================================================================
// User Avatar
// =============================================================================

function UserAvatar() {
    return (
        <div
            title="Account"
            style={{
                width:        "30px",
                height:       "30px",
                borderRadius: "50%",
                background:   "var(--color-bg-subtle)",
                border:       "1px solid var(--color-border)",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                cursor:       "pointer",
                color:        "var(--color-text-muted)",
                flexShrink:   0,
            }}
        >
            <UserIcon />
        </div>
    );
}

// =============================================================================
// Icons
// =============================================================================

function MenuIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
    );
}

function SunIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1"  x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1"  y1="12" x2="3"  y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    );
}
