/**
 * ============================================================================
 * AN Dev Studio
 * Sidebar Navigation
 * ============================================================================
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
    open:     boolean;
    onToggle: () => void;
}

interface NavItem {
    href:  string;
    label: string;
    icon:  React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    {
        href:  "/",
        label: "Dashboard",
        icon:  <DashboardIcon />,
    },
    {
        href:  "/projects",
        label: "Projects",
        icon:  <ProjectsIcon />,
    },
    {
        href:  "/workspace",
        label: "Workspace",
        icon:  <WorkspaceIcon />,
    },
    {
        href:  "/ai",
        label: "AI Studio",
        icon:  <AIIcon />,
    },
];

const BOTTOM_NAV: NavItem[] = [
    {
        href:  "/settings",
        label: "Settings",
        icon:  <SettingsIcon />,
    },
];

export function Sidebar({ open }: SidebarProps) {

    const pathname = usePathname();

    const width = open ? "240px" : "60px";

    return (
        <aside style={{
            width,
            minWidth:  width,
            height:    "100dvh",
            background: "var(--color-bg-surface)",
            borderRight: "1px solid var(--color-border)",
            display:    "flex",
            flexDirection: "column",
            transition: "width 0.2s ease",
            overflow:   "hidden",
        }}>

            {/* Logo */}
            <div style={{
                height:     "var(--topbar-height)",
                display:    "flex",
                alignItems: "center",
                padding:    open ? "0 16px" : "0",
                justifyContent: open ? "flex-start" : "center",
                borderBottom: "1px solid var(--color-border)",
                flexShrink:  0,
            }}>
                <div style={{
                    width:        "30px",
                    height:       "30px",
                    borderRadius: "8px",
                    background:   "var(--color-accent)",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    color:        "#fff",
                    fontWeight:   700,
                    fontSize:     "14px",
                    flexShrink:   0,
                }}>
                    AN
                </div>
                {open && (
                    <span style={{
                        marginLeft: "10px",
                        fontWeight: 700,
                        fontSize:   "14px",
                        color:      "var(--color-text)",
                        whiteSpace: "nowrap",
                    }}>
                        Dev Studio
                    </span>
                )}
            </div>

            {/* Primary nav */}
            <nav style={{
                flex:    1,
                padding: "12px 8px",
                display: "flex",
                flexDirection: "column",
                gap:     "2px",
                overflowY: "auto",
            }}>
                {NAV_ITEMS.map(item => (
                    <NavLink
                        key={item.href}
                        item={item}
                        active={pathname === item.href}
                        collapsed={!open}
                    />
                ))}
            </nav>

            {/* Bottom nav */}
            <div style={{
                padding:     "8px 8px 16px",
                borderTop:   "1px solid var(--color-border)",
                display:     "flex",
                flexDirection: "column",
                gap:         "2px",
            }}>
                {BOTTOM_NAV.map(item => (
                    <NavLink
                        key={item.href}
                        item={item}
                        active={pathname === item.href}
                        collapsed={!open}
                    />
                ))}
            </div>
        </aside>
    );
}

// =============================================================================
// NavLink
// =============================================================================

function NavLink({
    item,
    active,
    collapsed,
}: {
    item:      NavItem;
    active:    boolean;
    collapsed: boolean;
}) {

    return (
        <Link
            href={item.href}
            title={collapsed ? item.label : undefined}
            style={{
                display:        "flex",
                alignItems:     "center",
                gap:            "10px",
                padding:        collapsed ? "9px 0" : "9px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius:   "8px",
                textDecoration: "none",
                fontWeight:     active ? 600 : 400,
                fontSize:       "13.5px",
                color:          active
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
                background: active
                    ? "color-mix(in srgb, var(--color-accent) 10%, transparent)"
                    : "transparent",
                transition: "background 0.12s, color 0.12s",
            }}
        >
            <span style={{ flexShrink: 0, display: "flex" }}>
                {item.icon}
            </span>
            {!collapsed && (
                <span style={{ whiteSpace: "nowrap" }}>
                    {item.label}
                </span>
            )}
        </Link>
    );
}

// =============================================================================
// Icons (inline SVG — no dependency)
// =============================================================================

function DashboardIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
        </svg>
    );
}

function ProjectsIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
    );
}

function WorkspaceIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
        </svg>
    );
}

function AIIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10"/>
            <path d="M12 8v4l3 3"/>
            <circle cx="19" cy="5" r="3"/>
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93a10 10 0 0 1 1.42 13.44M4.93 4.93a10 10 0 0 0 0 14.14"/>
        </svg>
    );
}
