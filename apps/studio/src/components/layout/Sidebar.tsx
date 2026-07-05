/**
 * ============================================================================
 * AN Dev Studio
 * Sidebar Navigation — grouped sections, build anything
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
    badge?: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

// ── Navigation structure ──────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
    {
        title: "Core",
        items: [
            { href: "/",          label: "Dashboard",  icon: <DashboardIcon /> },
            { href: "/builder",   label: "Builder",    icon: <AppIcon /> },
            { href: "/projects",  label: "Projects",   icon: <ProjectsIcon /> },
            { href: "/workspace", label: "Workspace",  icon: <WorkspaceIcon /> },
            { href: "/ai",        label: "AI Studio",  icon: <AIIcon /> },
        ],
    },
    {
        title: "Build",
        items: [
            { href: "/projects/new?type=website",    label: "Website",          icon: <GlobeIcon /> },
            { href: "/projects/new?type=webapp",     label: "Web App",          icon: <AppIcon /> },
            { href: "/mobile",                       label: "Mobile App",       icon: <MobileIcon /> },
            { href: "/projects/new?type=desktop",    label: "Desktop App",      icon: <DesktopIcon /> },
            { href: "/projects/new?type=api",        label: "API / Backend",    icon: <ApiIcon /> },
            { href: "/projects/new?type=extension",  label: "Browser Ext",      icon: <ExtIcon /> },
            { href: "/projects/new?type=game",       label: "Game",             icon: <GameIcon /> },
            { href: "/projects/new?type=automation", label: "Automation",       icon: <AutoIcon /> },
            { href: "/projects/new?type=cli",        label: "CLI Tool",         icon: <CliIcon /> },
            { href: "/projects/new?type=aiml",       label: "AI / ML Model",    icon: <AimlIcon />, badge: "AI" },
            { href: "/projects/new?type=saas",       label: "SaaS Product",     icon: <SaaSIcon />, badge: "🔥" },
            { href: "/projects/new",                 label: "Custom Product",   icon: <CustomIcon /> },
        ],
    },
    {
        title: "Enterprise",
        items: [
            { href: "/erp", label: "ERP System",  icon: <ErpIcon /> },
            { href: "/crm", label: "CRM System",  icon: <CrmIcon /> },
        ],
    },
];

const BOTTOM_NAV: NavItem[] = [
    { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar({ open }: SidebarProps) {

    const pathname = usePathname();
    const width    = open ? "220px" : "56px";

    return (
        <aside style={{
            width,
            minWidth:      width,
            height:        "100dvh",
            background:    "var(--color-bg-surface)",
            borderRight:   "1px solid var(--color-border)",
            display:       "flex",
            flexDirection: "column",
            transition:    "width 0.2s ease",
            overflow:      "hidden",
        }}>

            {/* Logo -------------------------------------------------------- */}
            <div style={{
                height:         "var(--topbar-height, 56px)",
                display:        "flex",
                alignItems:     "center",
                padding:        open ? "0 14px" : "0",
                justifyContent: open ? "flex-start" : "center",
                borderBottom:   "1px solid var(--color-border)",
                flexShrink:     0,
            }}>
                <div style={{
                    width:          "28px",
                    height:         "28px",
                    borderRadius:   "8px",
                    background:     "var(--color-accent)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          "#fff",
                    fontWeight:     800,
                    fontSize:       "12px",
                    flexShrink:     0,
                    letterSpacing:  "-0.5px",
                }}>
                    AN
                </div>
                {open && (
                    <div style={{ marginLeft: "9px" }}>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--color-text)", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                            Dev Studio
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                            AN GROUP
                        </div>
                    </div>
                )}
            </div>

            {/* Nav sections ------------------------------------------------ */}
            <nav style={{
                flex:          1,
                padding:       "10px 6px",
                display:       "flex",
                flexDirection: "column",
                gap:           "0px",
                overflowY:     "auto",
                scrollbarWidth: "none",
            }}>
                {NAV_SECTIONS.map((section, si) => (
                    <div key={si} style={{ marginBottom: "6px" }}>
                        {/* Section header */}
                        {open && (
                            <div style={{
                                fontSize:      "10px",
                                fontWeight:    700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color:         "var(--color-text-muted)",
                                padding:       "6px 10px 3px",
                                opacity:       0.6,
                            }}>
                                {section.title}
                            </div>
                        )}
                        {!open && si > 0 && (
                            <div style={{
                                height:     "1px",
                                background: "var(--color-border)",
                                margin:     "6px 8px",
                            }} />
                        )}
                        {section.items.map(item => (
                            <NavLink
                                key={item.href}
                                item={item}
                                active={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]) && !item.href.includes("?"))}
                                collapsed={!open}
                            />
                        ))}
                    </div>
                ))}
            </nav>

            {/* Bottom nav -------------------------------------------------- */}
            <div style={{
                padding:       "6px 6px 14px",
                borderTop:     "1px solid var(--color-border)",
                display:       "flex",
                flexDirection: "column",
                gap:           "2px",
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

// ── NavLink ───────────────────────────────────────────────────────────────────

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
                gap:            "8px",
                padding:        collapsed ? "7px 0" : "7px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius:   "7px",
                textDecoration: "none",
                fontWeight:     active ? 600 : 400,
                fontSize:       "13px",
                color:          active ? "var(--color-accent)" : "var(--color-text-muted)",
                background:     active
                    ? "color-mix(in srgb, var(--color-accent) 12%, transparent)"
                    : "transparent",
                transition:     "background 0.12s, color 0.12s",
                position:       "relative",
            }}
        >
            <span style={{ flexShrink: 0, display: "flex", opacity: active ? 1 : 0.75 }}>
                {item.icon}
            </span>
            {!collapsed && (
                <>
                    <span style={{ whiteSpace: "nowrap", flex: 1 }}>{item.label}</span>
                    {item.badge && (
                        <span style={{
                            fontSize:     "9px",
                            fontWeight:   700,
                            background:   "var(--color-accent)",
                            color:        "#fff",
                            borderRadius: "4px",
                            padding:      "1px 5px",
                            letterSpacing: "0.02em",
                        }}>
                            {item.badge}
                        </span>
                    )}
                </>
            )}
        </Link>
    );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function DashboardIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function ProjectsIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}
function WorkspaceIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}
function AIIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>;
}
function GlobeIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
function AppIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function MobileIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
}
function DesktopIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><polyline points="8 21 12 17 16 21"/></svg>;
}
function ApiIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>;
}
function ExtIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function GameIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="13" r="1"/><circle cx="18" cy="11" r="1"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>;
}
function AutoIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
}
function CliIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;
}
function AimlIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>;
}
function SaaSIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
}
function CustomIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}
function ErpIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}
function CrmIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function SettingsIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 1.42 13.44M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>;
}
