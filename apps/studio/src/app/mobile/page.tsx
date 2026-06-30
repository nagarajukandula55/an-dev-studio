"use client";

/**
 * ============================================================================
 * AN Dev Studio — Mobile App Builder
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MobileTemplate {
    id:          string;
    name:        string;
    description: string;
    icon:        string;
    color:       string;
    tags:        string[];
    platforms:   string[];
}

interface MobileFeature {
    icon:        string;
    label:       string;
    description: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const MOBILE_TEMPLATES: MobileTemplate[] = [
    {
        id:          "ecommerce",
        name:        "E-Commerce App",
        description: "Full shopping experience with cart, payments, orders",
        icon:        "🛒",
        color:       "#3b82f6",
        tags:        ["React Native", "Stripe", "Firebase"],
        platforms:   ["iOS", "Android"],
    },
    {
        id:          "social",
        name:        "Social Network",
        description: "Feeds, profiles, messaging, stories, notifications",
        icon:        "💬",
        color:       "#8b5cf6",
        tags:        ["React Native", "Socket.io", "Supabase"],
        platforms:   ["iOS", "Android"],
    },
    {
        id:          "fitness",
        name:        "Fitness Tracker",
        description: "Workouts, step counter, nutrition, health charts",
        icon:        "💪",
        color:       "#10b981",
        tags:        ["React Native", "HealthKit", "Google Fit"],
        platforms:   ["iOS", "Android"],
    },
    {
        id:          "delivery",
        name:        "Delivery App",
        description: "Real-time tracking, driver app, customer app, admin panel",
        icon:        "🚀",
        color:       "#f59e0b",
        tags:        ["React Native", "Google Maps", "Node.js"],
        platforms:   ["iOS", "Android"],
    },
    {
        id:          "education",
        name:        "EdTech / LMS",
        description: "Courses, video lessons, quizzes, progress tracking",
        icon:        "📚",
        color:       "#06b6d4",
        tags:        ["React Native", "Video.js", "Firebase"],
        platforms:   ["iOS", "Android"],
    },
    {
        id:          "fintech",
        name:        "FinTech / Wallet",
        description: "UPI, wallet, expense tracking, investment portfolio",
        icon:        "💳",
        color:       "#ef4444",
        tags:        ["React Native", "RazorPay", "Plaid"],
        platforms:   ["iOS", "Android"],
    },
    {
        id:          "booking",
        name:        "Booking & Appointments",
        description: "Service booking, calendar, payments, reminders",
        icon:        "📅",
        color:       "#84cc16",
        tags:        ["React Native", "Stripe", "Calendly API"],
        platforms:   ["iOS", "Android"],
    },
    {
        id:          "blank",
        name:        "Start from Scratch",
        description: "Blank React Native + Expo project, zero assumptions",
        icon:        "✨",
        color:       "#94a3b8",
        tags:        ["React Native", "Expo", "TypeScript"],
        platforms:   ["iOS", "Android", "Web"],
    },
];

const MOBILE_FEATURES: MobileFeature[] = [
    { icon: "⚡", label: "React Native + Expo", description: "Cross-platform iOS & Android from one codebase" },
    { icon: "🎨", label: "UI Component Library", description: "Pre-built screens and components ready to customise" },
    { icon: "🔐", label: "Auth Templates", description: "Biometric, OTP, social login scaffolded out-of-the-box" },
    { icon: "🗺️", label: "Navigation wired up", description: "Stack, tabs, drawer — all configured and ready" },
    { icon: "📲", label: "Push Notifications", description: "Firebase / Expo Notifications integrated from day one" },
    { icon: "🧪", label: "Test suite included", description: "Jest + Detox E2E tests scaffolded alongside your app" },
    { icon: "🚀", label: "EAS Build & Submit", description: "One-command publish to App Store and Play Store" },
    { icon: "🤖", label: "ANu writes the code", description: "Describe screens and ANu generates the implementation" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function MobilePage() {

    const [mounted, setMounted] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <AppShell title="Mobile App Builder">
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

                {/* Hero */}
                <div style={{
                    background:   "linear-gradient(135deg, color-mix(in srgb, #8b5cf6 12%, var(--color-bg-surface)), var(--color-bg-surface))",
                    border:       "1px solid var(--color-border)",
                    borderRadius: "16px",
                    padding:      "30px 28px",
                    marginBottom: "28px",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "24px",
                }}>
                    <div style={{ fontSize: "56px", lineHeight: 1 }}>📱</div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-text)", margin: "0 0 6px" }}>
                            Build Your Mobile App with ANu
                        </h1>
                        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
                            Pick a template, describe your app to ANu, and get a production-ready React Native codebase — iOS, Android, and Web from one project.
                        </p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {["React Native", "Expo", "TypeScript", "iOS + Android", "1 Codebase"].map(tag => (
                                <span key={tag} style={{
                                    background:   "color-mix(in srgb, #8b5cf6 15%, transparent)",
                                    color:        "#8b5cf6",
                                    borderRadius: "20px",
                                    padding:      "3px 10px",
                                    fontSize:     "11px",
                                    fontWeight:   600,
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <Link href="/projects/new?type=mobile" style={{
                        background:     "var(--color-accent)",
                        color:          "#fff",
                        border:         "none",
                        borderRadius:   "10px",
                        padding:        "12px 24px",
                        fontSize:       "14px",
                        fontWeight:     700,
                        cursor:         "pointer",
                        textDecoration: "none",
                        whiteSpace:     "nowrap",
                    }}>
                        Start Building →
                    </Link>
                </div>

                {/* Features strip */}
                <div style={{
                    display:             "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap:                 "10px",
                    marginBottom:        "28px",
                }}>
                    {MOBILE_FEATURES.map(f => (
                        <div key={f.label} style={{
                            background:   "var(--color-bg-surface)",
                            border:       "1px solid var(--color-border)",
                            borderRadius: "10px",
                            padding:      "14px",
                            display:      "flex",
                            gap:          "10px",
                            alignItems:   "flex-start",
                        }}>
                            <span style={{ fontSize: "18px", flexShrink: 0 }}>{f.icon}</span>
                            <div>
                                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", marginBottom: "2px" }}>{f.label}</div>
                                <div style={{ fontSize: "11px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>{f.description}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Templates */}
                <h2 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text)", marginBottom: "14px" }}>
                    App Templates
                </h2>
                <div style={{
                    display:             "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap:                 "14px",
                    marginBottom:        "28px",
                }}>
                    {MOBILE_TEMPLATES.map(tmpl => (
                        <div
                            key={tmpl.id}
                            onClick={() => setSelected(tmpl.id)}
                            style={{
                                background:   "var(--color-bg-surface)",
                                border:       `1px solid ${selected === tmpl.id ? tmpl.color + "80" : "var(--color-border)"}`,
                                borderRadius: "12px",
                                padding:      "18px",
                                cursor:       "pointer",
                                transition:   "border-color 0.15s, box-shadow 0.15s",
                                boxShadow:    selected === tmpl.id ? `0 0 0 3px ${tmpl.color}18` : "none",
                            }}
                        >
                            <div style={{
                                width:          "44px",
                                height:         "44px",
                                borderRadius:   "12px",
                                background:     `${tmpl.color}18`,
                                display:        "flex",
                                alignItems:     "center",
                                justifyContent: "center",
                                fontSize:       "22px",
                                marginBottom:   "12px",
                            }}>
                                {tmpl.icon}
                            </div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", marginBottom: "5px" }}>
                                {tmpl.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "10px", lineHeight: 1.4 }}>
                                {tmpl.description}
                            </div>
                            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "8px" }}>
                                {tmpl.tags.map(tag => (
                                    <span key={tag} style={{
                                        background:   `${tmpl.color}14`,
                                        color:        tmpl.color,
                                        borderRadius: "4px",
                                        padding:      "1px 6px",
                                        fontSize:     "10px",
                                        fontWeight:   500,
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                {tmpl.platforms.join(" · ")}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                {selected && (
                    <div style={{
                        position:     "sticky",
                        bottom:       "24px",
                        background:   "var(--color-bg-surface)",
                        border:       "1px solid var(--color-accent)",
                        borderRadius: "12px",
                        padding:      "16px 20px",
                        display:      "flex",
                        alignItems:   "center",
                        gap:          "16px",
                        boxShadow:    "0 8px 32px rgba(0,0,0,0.15)",
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>
                                {MOBILE_TEMPLATES.find(t => t.id === selected)?.icon}{" "}
                                {MOBILE_TEMPLATES.find(t => t.id === selected)?.name} selected
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                                ANu will scaffold this app and guide you through customisation
                            </div>
                        </div>
                        <Link
                            href={`/projects/new?type=mobile&template=${selected}`}
                            style={{
                                background:     "var(--color-accent)",
                                color:          "#fff",
                                border:         "none",
                                borderRadius:   "8px",
                                padding:        "10px 22px",
                                fontSize:       "13px",
                                fontWeight:     600,
                                cursor:         "pointer",
                                textDecoration: "none",
                            }}
                        >
                            Build This App →
                        </Link>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
