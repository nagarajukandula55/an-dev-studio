"use client";

/**
 * ============================================================================
 * AN Dev Studio — Enterprise Resource Planning (ERP) Module
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";

// ── Types ─────────────────────────────────────────────────────────────────────

interface KpiCard {
    label:  string;
    value:  string;
    change: string;
    up:     boolean;
    icon:   string;
    color:  string;
}

interface ErpModule {
    id:          string;
    title:       string;
    description: string;
    icon:        string;
    color:       string;
    status:      "live" | "beta" | "coming";
    metrics:     string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const KPI_CARDS: KpiCard[] = [
    { label: "Total Revenue",    value: "₹0",    change: "Start tracking",   up: true,  icon: "💰", color: "#10b981" },
    { label: "Active Orders",    value: "0",     change: "No orders yet",    up: true,  icon: "📦", color: "#3b82f6" },
    { label: "Inventory Items",  value: "0",     change: "Add items",        up: true,  icon: "🏭", color: "#8b5cf6" },
    { label: "Employees",        value: "0",     change: "Add your team",    up: true,  icon: "👥", color: "#f59e0b" },
];

const ERP_MODULES: ErpModule[] = [
    {
        id:          "finance",
        title:       "Finance & Accounting",
        description: "Invoices, payments, ledger, GST filing, P&L statements, balance sheets",
        icon:        "💳",
        color:       "#10b981",
        status:      "beta",
        metrics:     "Invoicing • Payments • Tax",
    },
    {
        id:          "inventory",
        title:       "Inventory Management",
        description: "Stock tracking, purchase orders, warehouse management, low-stock alerts",
        icon:        "📦",
        color:       "#3b82f6",
        status:      "beta",
        metrics:     "Stock • Orders • Warehouses",
    },
    {
        id:          "hr",
        title:       "HR & Payroll",
        description: "Employee profiles, attendance, leave management, payroll processing, appraisals",
        icon:        "👥",
        color:       "#8b5cf6",
        status:      "beta",
        metrics:     "Employees • Payroll • Leave",
    },
    {
        id:          "supply",
        title:       "Supply Chain",
        description: "Vendor management, procurement, logistics, delivery tracking",
        icon:        "🔗",
        color:       "#f59e0b",
        status:      "coming",
        metrics:     "Vendors • Logistics • Delivery",
    },
    {
        id:          "manufacturing",
        title:       "Manufacturing",
        description: "Production planning, BOM, quality control, machine scheduling",
        icon:        "🏭",
        color:       "#ef4444",
        status:      "coming",
        metrics:     "Production • BOM • QC",
    },
    {
        id:          "sales",
        title:       "Sales & Distribution",
        description: "Sales orders, quotations, pricing rules, distribution channels",
        icon:        "📈",
        color:       "#06b6d4",
        status:      "beta",
        metrics:     "Orders • Quotes • Channels",
    },
    {
        id:          "projects",
        title:       "Project Management",
        description: "Task tracking, Gantt charts, resource allocation, billing milestones",
        icon:        "🎯",
        color:       "#84cc16",
        status:      "live",
        metrics:     "Tasks • Gantt • Billing",
    },
    {
        id:          "analytics",
        title:       "Business Intelligence",
        description: "Custom dashboards, KPI tracking, forecasting, automated reports",
        icon:        "📊",
        color:       "#f97316",
        status:      "coming",
        metrics:     "Dashboards • Forecasts • Reports",
    },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ErpPage() {

    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <AppShell title="ERP System">
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ marginBottom: "28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "28px" }}>🏢</span>
                        <div>
                            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
                                Enterprise Resource Planning
                            </h1>
                            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                                Manage your entire business operations in one place
                            </p>
                        </div>
                    </div>
                </div>

                {/* KPI Row */}
                <div style={{
                    display:             "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap:                 "14px",
                    marginBottom:        "28px",
                }}>
                    {KPI_CARDS.map((kpi) => (
                        <div key={kpi.label} style={{
                            background:   "var(--color-bg-surface)",
                            border:       "1px solid var(--color-border)",
                            borderRadius: "12px",
                            padding:      "16px",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                                        {kpi.label}
                                    </div>
                                    <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text)" }}>
                                        {kpi.value}
                                    </div>
                                    <div style={{ fontSize: "11px", color: kpi.up ? "#10b981" : "#ef4444", marginTop: "4px" }}>
                                        {kpi.up ? "↑" : "↓"} {kpi.change}
                                    </div>
                                </div>
                                <div style={{
                                    width:          "38px",
                                    height:         "38px",
                                    borderRadius:   "10px",
                                    background:     `${kpi.color}18`,
                                    display:        "flex",
                                    alignItems:     "center",
                                    justifyContent: "center",
                                    fontSize:       "18px",
                                }}>
                                    {kpi.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Module Grid */}
                <div style={{ marginBottom: "16px" }}>
                    <h2 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text)", marginBottom: "14px" }}>
                        ERP Modules
                    </h2>
                    <div style={{
                        display:             "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap:                 "14px",
                    }}>
                        {ERP_MODULES.map((mod) => (
                            <ModuleCard
                                key={mod.id}
                                mod={mod}
                                active={activeModule === mod.id}
                                onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Setup Banner */}
                <SetupBanner />
            </div>
        </AppShell>
    );
}

// ── ModuleCard ────────────────────────────────────────────────────────────────

function ModuleCard({ mod, active, onClick }: {
    mod:     ErpModule;
    active:  boolean;
    onClick: () => void;
}) {
    const statusColor: Record<string, string> = {
        live:   "#10b981",
        beta:   "#3b82f6",
        coming: "#94a3b8",
    };
    const statusLabel: Record<string, string> = {
        live:   "Live",
        beta:   "Beta",
        coming: "Coming soon",
    };

    return (
        <div
            onClick={onClick}
            style={{
                background:   "var(--color-bg-surface)",
                border:       `1px solid ${active ? mod.color + "60" : "var(--color-border)"}`,
                borderRadius: "12px",
                padding:      "18px",
                cursor:       "pointer",
                transition:   "border-color 0.15s, box-shadow 0.15s",
                boxShadow:    active ? `0 0 0 3px ${mod.color}18` : "none",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div style={{
                    width:          "40px",
                    height:         "40px",
                    borderRadius:   "10px",
                    background:     `${mod.color}18`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       "20px",
                }}>
                    {mod.icon}
                </div>
                <span style={{
                    fontSize:     "10px",
                    fontWeight:   600,
                    color:        statusColor[mod.status],
                    background:   `${statusColor[mod.status]}18`,
                    borderRadius: "20px",
                    padding:      "2px 8px",
                }}>
                    {statusLabel[mod.status]}
                </span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", marginBottom: "5px" }}>
                {mod.title}
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: "10px" }}>
                {mod.description}
            </div>
            <div style={{ fontSize: "11px", color: mod.color, fontWeight: 500 }}>
                {mod.metrics}
            </div>
        </div>
    );
}

// ── SetupBanner ───────────────────────────────────────────────────────────────

function SetupBanner() {
    return (
        <div style={{
            marginTop:    "24px",
            background:   "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 8%, transparent), color-mix(in srgb, var(--color-accent) 3%, transparent))",
            border:       "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
            borderRadius: "14px",
            padding:      "24px",
            display:      "flex",
            alignItems:   "center",
            gap:          "20px",
        }}>
            <div style={{ fontSize: "40px" }}>🧠</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text)", marginBottom: "4px" }}>
                    Let ANu set up your ERP
                </div>
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                    Tell ANu about your business — industry, team size, workflows — and it will configure your ERP modules, import data, and get you running in minutes.
                </div>
            </div>
            <button
                onClick={() => {
                    const btn = document.querySelector("[data-anu-trigger]") as HTMLButtonElement;
                    if (btn) btn.click();
                }}
                style={{
                    background:   "var(--color-accent)",
                    color:        "#fff",
                    border:       "none",
                    borderRadius: "8px",
                    padding:      "10px 20px",
                    fontSize:     "13px",
                    fontWeight:   600,
                    cursor:       "pointer",
                    whiteSpace:   "nowrap",
                }}
            >
                Setup with ANu →
            </button>
        </div>
    );
}
