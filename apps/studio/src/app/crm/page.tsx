"use client";

/**
 * ============================================================================
 * AN Dev Studio — CRM (Customer Relationship Management) Module
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PipelineStage {
    id:       string;
    label:    string;
    color:    string;
    count:    number;
    value:    string;
}

interface CrmFeature {
    icon:        string;
    title:       string;
    description: string;
    color:       string;
    status:      "live" | "beta" | "coming";
}

// ── Data ──────────────────────────────────────────────────────────────────────

const PIPELINE_STAGES: PipelineStage[] = [
    { id: "lead",      label: "New Leads",      color: "#94a3b8", count: 0, value: "₹0" },
    { id: "qualify",   label: "Qualified",       color: "#3b82f6", count: 0, value: "₹0" },
    { id: "proposal",  label: "Proposal Sent",   color: "#f59e0b", count: 0, value: "₹0" },
    { id: "negotiate", label: "Negotiation",     color: "#8b5cf6", count: 0, value: "₹0" },
    { id: "won",       label: "Won",             color: "#10b981", count: 0, value: "₹0" },
    { id: "lost",      label: "Lost",            color: "#ef4444", count: 0, value: "₹0" },
];

const CRM_FEATURES: CrmFeature[] = [
    {
        icon:        "👤",
        title:       "Contact Management",
        description: "Store contacts, companies, interaction history, tags, custom fields",
        color:       "#3b82f6",
        status:      "beta",
    },
    {
        icon:        "📊",
        title:       "Sales Pipeline",
        description: "Kanban deal board, drag-and-drop, weighted forecasting, stage automation",
        color:       "#8b5cf6",
        status:      "beta",
    },
    {
        icon:        "📧",
        title:       "Email & Communication",
        description: "Email sequences, templates, auto-follow-ups, call logging, WhatsApp integration",
        color:       "#f59e0b",
        status:      "coming",
    },
    {
        icon:        "🤖",
        title:       "AI Lead Scoring",
        description: "ANu scores leads by behaviour, predicts deal probability, suggests next action",
        color:       "#10b981",
        status:      "beta",
    },
    {
        icon:        "📅",
        title:       "Tasks & Calendar",
        description: "Follow-up reminders, meeting scheduling, activity timeline per contact",
        color:       "#06b6d4",
        status:      "beta",
    },
    {
        icon:        "📈",
        title:       "Reports & Analytics",
        description: "Revenue forecasts, rep performance, conversion rates, churn analysis",
        color:       "#ef4444",
        status:      "coming",
    },
    {
        icon:        "🔗",
        title:       "Integrations",
        description: "Sync with Gmail, Outlook, Slack, Razorpay, Stripe, WhatsApp Business",
        color:       "#f97316",
        status:      "coming",
    },
    {
        icon:        "📱",
        title:       "Mobile CRM",
        description: "iOS & Android app with offline mode, card scanner, voice notes",
        color:       "#84cc16",
        status:      "coming",
    },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CrmPage() {

    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"pipeline" | "contacts" | "features">("pipeline");

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <AppShell title="CRM System">
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "28px" }}>🤝</span>
                        <div>
                            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
                                Customer Relationships
                            </h1>
                            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                                Track every deal, contact, and conversation in one place
                            </p>
                        </div>
                    </div>
                    <button style={{
                        background:   "var(--color-accent)",
                        color:        "#fff",
                        border:       "none",
                        borderRadius: "8px",
                        padding:      "9px 18px",
                        fontSize:     "13px",
                        fontWeight:   600,
                        cursor:       "pointer",
                        display:      "flex",
                        alignItems:   "center",
                        gap:          "6px",
                    }}>
                        <span>+</span> Add Contact
                    </button>
                </div>

                {/* Stats Row */}
                <div style={{
                    display:             "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap:                 "12px",
                    marginBottom:        "24px",
                }}>
                    {[
                        { label: "Total Contacts",   value: "0",  icon: "👤", color: "#3b82f6" },
                        { label: "Open Deals",        value: "0",  icon: "💼", color: "#8b5cf6" },
                        { label: "Pipeline Value",    value: "₹0", icon: "💰", color: "#10b981" },
                        { label: "Conversion Rate",   value: "0%", icon: "🎯", color: "#f59e0b" },
                        { label: "Activities Today",  value: "0",  icon: "📅", color: "#06b6d4" },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            background:   "var(--color-bg-surface)",
                            border:       "1px solid var(--color-border)",
                            borderRadius: "10px",
                            padding:      "14px",
                            textAlign:    "center",
                        }}>
                            <div style={{ fontSize: "20px", marginBottom: "4px" }}>{stat.icon}</div>
                            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text)" }}>{stat.value}</div>
                            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "1px solid var(--color-border)" }}>
                    {(["pipeline", "contacts", "features"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding:      "8px 16px",
                                border:       "none",
                                background:   "transparent",
                                borderBottom: `2px solid ${activeTab === tab ? "var(--color-accent)" : "transparent"}`,
                                color:        activeTab === tab ? "var(--color-accent)" : "var(--color-text-muted)",
                                fontSize:     "13px",
                                fontWeight:   activeTab === tab ? 600 : 400,
                                cursor:       "pointer",
                                textTransform: "capitalize",
                                marginBottom: "-1px",
                            }}
                        >
                            {tab === "pipeline" ? "📊 Pipeline" : tab === "contacts" ? "👥 Contacts" : "⚡ Features"}
                        </button>
                    ))}
                </div>

                {/* Pipeline Tab */}
                {activeTab === "pipeline" && (
                    <div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
                            {PIPELINE_STAGES.map(stage => (
                                <div key={stage.id} style={{
                                    background:   "var(--color-bg-surface)",
                                    border:       "1px solid var(--color-border)",
                                    borderRadius: "10px",
                                    padding:      "14px",
                                    borderTop:    `3px solid ${stage.color}`,
                                }}>
                                    <div style={{ fontSize: "12px", fontWeight: 600, color: stage.color, marginBottom: "8px" }}>
                                        {stage.label}
                                    </div>
                                    <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text)" }}>
                                        {stage.count}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                        {stage.value}
                                    </div>
                                    <div style={{
                                        marginTop:    "10px",
                                        height:       "50px",
                                        border:       "1px dashed var(--color-border)",
                                        borderRadius: "6px",
                                        display:      "flex",
                                        alignItems:   "center",
                                        justifyContent: "center",
                                        fontSize:     "11px",
                                        color:        "var(--color-text-muted)",
                                    }}>
                                        + Add deal
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{
                            marginTop:    "20px",
                            padding:      "18px",
                            background:   "var(--color-bg-surface)",
                            border:       "1px solid var(--color-border)",
                            borderRadius: "10px",
                            textAlign:    "center",
                            color:        "var(--color-text-muted)",
                            fontSize:     "13px",
                        }}>
                            🤖 ANu can import your existing contacts and deals from a CSV or your email — click the ANu guide button to get started
                        </div>
                    </div>
                )}

                {/* Contacts Tab */}
                {activeTab === "contacts" && (
                    <div style={{
                        background:   "var(--color-bg-surface)",
                        border:       "1px solid var(--color-border)",
                        borderRadius: "10px",
                        overflow:     "hidden",
                    }}>
                        <div style={{ padding: "16px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: "10px" }}>
                            <input
                                placeholder="Search contacts..."
                                style={{
                                    flex:         1,
                                    padding:      "8px 12px",
                                    border:       "1px solid var(--color-border)",
                                    borderRadius: "7px",
                                    background:   "var(--color-bg)",
                                    color:        "var(--color-text)",
                                    fontSize:     "13px",
                                    outline:      "none",
                                }}
                            />
                            <button style={{
                                background:   "var(--color-accent)",
                                color:        "#fff",
                                border:       "none",
                                borderRadius: "7px",
                                padding:      "8px 16px",
                                fontSize:     "13px",
                                cursor:       "pointer",
                            }}>
                                Import CSV
                            </button>
                        </div>
                        <div style={{ padding: "60px 24px", textAlign: "center" }}>
                            <div style={{ fontSize: "40px", marginBottom: "12px" }}>👤</div>
                            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
                                No contacts yet
                            </div>
                            <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "20px" }}>
                                Add your first contact manually or import from CSV / email
                            </div>
                            <button style={{
                                background:   "var(--color-accent)",
                                color:        "#fff",
                                border:       "none",
                                borderRadius: "8px",
                                padding:      "10px 24px",
                                fontSize:     "13px",
                                fontWeight:   600,
                                cursor:       "pointer",
                            }}>
                                + Add First Contact
                            </button>
                        </div>
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === "features" && (
                    <div style={{
                        display:             "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap:                 "14px",
                    }}>
                        {CRM_FEATURES.map(feat => {
                            const statusColor: Record<string, string> = { live: "#10b981", beta: "#3b82f6", coming: "#94a3b8" };
                            const statusLabel: Record<string, string> = { live: "Live", beta: "Beta", coming: "Soon" };
                            return (
                                <div key={feat.title} style={{
                                    background:   "var(--color-bg-surface)",
                                    border:       "1px solid var(--color-border)",
                                    borderRadius: "12px",
                                    padding:      "16px",
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                        <div style={{
                                            width:          "38px",
                                            height:         "38px",
                                            borderRadius:   "10px",
                                            background:     `${feat.color}18`,
                                            display:        "flex",
                                            alignItems:     "center",
                                            justifyContent: "center",
                                            fontSize:       "18px",
                                        }}>
                                            {feat.icon}
                                        </div>
                                        <span style={{
                                            fontSize:     "10px",
                                            fontWeight:   600,
                                            color:        statusColor[feat.status],
                                            background:   `${statusColor[feat.status]}18`,
                                            borderRadius: "20px",
                                            padding:      "2px 8px",
                                        }}>
                                            {statusLabel[feat.status]}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", marginBottom: "5px" }}>
                                        {feat.title}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                                        {feat.description}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
