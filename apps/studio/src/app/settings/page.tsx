/**
 * ============================================================================
 * AN Dev Studio — Settings Module
 * ============================================================================
 */

"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button }   from "@/components/ui/Button";
import { Input }    from "@/components/ui/Input";
import { Badge }    from "@/components/ui/Badge";

type SettingsTab = "general" | "ai" | "providers" | "appearance" | "about";

const TABS: { id: SettingsTab; label: string }[] = [
    { id: "general",    label: "General" },
    { id: "ai",         label: "AI & Agents" },
    { id: "providers",  label: "Providers" },
    { id: "appearance", label: "Appearance" },
    { id: "about",      label: "About" },
];

export default function SettingsPage() {
    const [tab, setTab] = useState<SettingsTab>("general");

    return (
        <AppShell title="Settings">
            <div style={{
                display:             "grid",
                gridTemplateColumns: "200px 1fr",
                gap:                 "20px",
                alignItems:          "start",
            }}>
                {/* Sidebar nav */}
                <nav style={{
                    display:      "flex",
                    flexDirection: "column",
                    gap:          "2px",
                }}>
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            style={{
                                padding:     "8px 12px",
                                borderRadius: "8px",
                                border:      "none",
                                cursor:      "pointer",
                                textAlign:   "left",
                                fontSize:    "13.5px",
                                fontWeight:  tab === t.id ? 600 : 400,
                                background:  tab === t.id
                                    ? "color-mix(in srgb, var(--color-accent) 10%, transparent)"
                                    : "transparent",
                                color:       tab === t.id
                                    ? "var(--color-accent)"
                                    : "var(--color-text-muted)",
                                transition:  "background 0.12s, color 0.12s",
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <div>
                    {tab === "general"    && <GeneralSettings />}
                    {tab === "ai"         && <AISettings />}
                    {tab === "providers"  && <ProvidersSettings />}
                    {tab === "appearance" && <AppearanceSettings />}
                    {tab === "about"      && <AboutSettings />}
                </div>
            </div>
        </AppShell>
    );
}

// ---------------------------------------------------------------------------

function GeneralSettings() {
    return (
        <Card>
            <CardHeader title="General" subtitle="Basic workspace preferences" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Input label="Workspace Name" defaultValue="AN Dev Studio" />
                <Input label="Default Project Path" defaultValue="~/Development" />
                <ToggleRow
                    label="Auto-save"
                    description="Automatically save changes to files"
                    defaultOn
                />
                <ToggleRow
                    label="Telemetry"
                    description="Send anonymous usage statistics to improve the product"
                />
                <div style={{ paddingTop: "4px" }}>
                    <Button variant="primary">Save Changes</Button>
                </div>
            </div>
        </Card>
    );
}

function AISettings() {
    return (
        <Card>
            <CardHeader title="AI & Agents" subtitle="Configure the multi-agent system" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <ToggleRow
                    label="Multi-Agent Mode"
                    description="Enable the full 7-agent orchestration pipeline"
                    defaultOn
                />
                <ToggleRow
                    label="Self-Healing"
                    description="Automatically retry failed agent tasks with recovery strategies"
                    defaultOn
                />
                <Input label="Max Retries per Task" type="number" defaultValue="3" />
                <Input label="Agent Timeout (ms)" type="number" defaultValue="30000" />
                <ToggleRow
                    label="Context Memory"
                    description="Persist conversation context between sessions"
                    defaultOn
                />
                <div style={{ paddingTop: "4px" }}>
                    <Button variant="primary">Save Changes</Button>
                </div>
            </div>
        </Card>
    );
}

interface ProviderInfo {
    name: string;
    label: string;
    configured: boolean;
    defaultModel: string;
    models: { id: string; name: string; free: boolean }[];
}

const PROVIDER_DOCS: Record<string, { keyName: string; url: string; envVar: string }> = {
    groq:        { keyName: "API Key",  url: "https://console.groq.com",                          envVar: "GROQ_API_KEY"       },
    cerebras:    { keyName: "API Key",  url: "https://cloud.cerebras.ai",                          envVar: "CEREBRAS_API_KEY"   },
    openrouter:  { keyName: "API Key",  url: "https://openrouter.ai/keys",                         envVar: "OPENROUTER_API_KEY" },
    gemini:      { keyName: "API Key",  url: "https://aistudio.google.com/app/apikey",             envVar: "GOOGLE_AI_API_KEY"  },
    huggingface: { keyName: "HF Token", url: "https://huggingface.co/settings/tokens",             envVar: "HF_TOKEN"           },
};

function ProvidersSettings() {
    const [providers, setProviders]     = useState<ProviderInfo[]>([]);
    const [testing, setTesting]         = useState<string | null>(null);
    const [testResult, setTestResult]   = useState<Record<string, "ok" | "fail">>({});

    useEffect(() => {
        fetch("/api/providers")
            .then(r => r.json())
            .then((d: { providers: ProviderInfo[] }) => setProviders(d.providers))
            .catch(() => setProviders([]));
    }, []);

    async function testProvider(name: string) {
        setTesting(name);
        try {
            const res = await fetch("/api/chat", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({
                    messages:  [{ role: "user", content: "Reply with exactly: OK" }],
                    provider:  name,
                    agentType: undefined,
                }),
            });
            if (!res.ok) throw new Error("bad status");
            // Drain a few bytes to confirm stream starts
            const reader = res.body?.getReader();
            await reader?.read();
            reader?.releaseLock();
            setTestResult(r => ({ ...r, [name]: "ok" }));
        } catch {
            setTestResult(r => ({ ...r, [name]: "fail" }));
        } finally {
            setTesting(null);
        }
    }

    if (providers.length === 0) {
        return (
            <Card>
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-muted)", fontSize: "13.5px" }}>
                    Loading providers…
                </div>
            </Card>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Setup guide banner */}
            <Card>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "20px", flexShrink: 0 }}>📋</span>
                    <div>
                        <p style={{ margin: "0 0 4px", fontSize: "13.5px", fontWeight: 600, color: "var(--color-text)" }}>
                            How to configure providers
                        </p>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                            Add API keys to your <code style={{ background: "var(--color-bg-subtle)", padding: "1px 4px", borderRadius: "3px", fontSize: "11.5px" }}>.env.local</code> file
                            in the project root. Get a free key from each provider using the links below, then restart the dev server.
                            Groq is recommended as the primary provider — it&apos;s fast and free.
                        </p>
                    </div>
                </div>
            </Card>

            {providers.map(p => {
                const doc = PROVIDER_DOCS[p.name];
                const result = testResult[p.name];
                return (
                    <Card key={p.name}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                                    <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--color-text)" }}>
                                        {p.label}
                                    </span>
                                    <Badge variant={p.configured ? "success" : "default"} dot>
                                        {p.configured ? "Configured" : "Not configured"}
                                    </Badge>
                                    {result === "ok"   && <Badge variant="success">✓ Connection OK</Badge>}
                                    {result === "fail" && <Badge variant="danger">✗ Failed</Badge>}
                                </div>

                                {p.configured ? (
                                    <div style={{ fontSize: "12.5px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                                        <strong style={{ color: "var(--color-text)" }}>{doc?.envVar}</strong> is set · Default model:{" "}
                                        <code style={{ background: "var(--color-bg-subtle)", padding: "1px 4px", borderRadius: "3px", fontSize: "11px" }}>
                                            {p.defaultModel}
                                        </code>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: "12.5px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                                        Add to <code style={{ background: "var(--color-bg-subtle)", padding: "1px 4px", borderRadius: "3px", fontSize: "11px" }}>.env.local</code>:{" "}
                                        <code style={{ background: "var(--color-bg-subtle)", padding: "1px 4px", borderRadius: "3px", fontSize: "11px", color: "var(--color-accent)" }}>
                                            {doc?.envVar}=your_key_here
                                        </code>
                                        {" · "}
                                        <a href={doc?.url} target="_blank" rel="noreferrer" style={{ color: "var(--color-accent)", textDecoration: "none", fontSize: "12px" }}>
                                            Get free key →
                                        </a>
                                    </div>
                                )}

                                {/* Available models */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                    {p.models.map(m => (
                                        <span key={m.id} style={{
                                            fontSize: "11px", padding: "2px 7px", borderRadius: "5px",
                                            background: "var(--color-bg-subtle)", color: "var(--color-text-muted)",
                                            border: "1px solid var(--color-border)",
                                        }}>
                                            {m.name}{m.free && <span style={{ color: "#10b981", marginLeft: "2px" }}>·free</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {p.configured && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    loading={testing === p.name}
                                    onClick={() => testProvider(p.name)}
                                >
                                    Test
                                </Button>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

function AppearanceSettings() {
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

    function applyTheme(t: typeof theme) {
        setTheme(t);
        if (t === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("studio-theme", "dark");
        } else if (t === "light") {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("studio-theme", "light");
        } else {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.classList.toggle("dark", isDark);
            localStorage.setItem("studio-theme", "system");
        }
    }

    return (
        <Card>
            <CardHeader title="Appearance" subtitle="Customize the look and feel" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--color-text-muted)", marginBottom: "8px" }}>
                        Theme
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {(["light", "dark", "system"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => applyTheme(t)}
                                style={{
                                    padding:      "8px 16px",
                                    borderRadius: "8px",
                                    border:       `1px solid ${theme === t ? "var(--color-accent)" : "var(--color-border)"}`,
                                    background:   theme === t
                                        ? "color-mix(in srgb, var(--color-accent) 10%, transparent)"
                                        : "var(--color-bg-surface)",
                                    color:        theme === t ? "var(--color-accent)" : "var(--color-text)",
                                    fontWeight:   theme === t ? 600 : 400,
                                    fontSize:     "13.5px",
                                    cursor:       "pointer",
                                    textTransform: "capitalize",
                                    transition:   "all 0.12s",
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <ToggleRow
                    label="Compact Mode"
                    description="Use a denser layout with reduced spacing"
                />
                <ToggleRow
                    label="Animations"
                    description="Enable UI transition animations"
                    defaultOn
                />
            </div>
        </Card>
    );
}

function AboutSettings() {
    return (
        <Card>
            <CardHeader title="About AN Dev Studio" />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                    { label: "Version",      value: "1.0.0-alpha"       },
                    { label: "Build",        value: "2026.06.30"        },
                    { label: "Next.js",      value: "16.2.9"            },
                    { label: "React",        value: "19.2.4"            },
                    { label: "Architecture", value: "ARCH-002 v1.0"     },
                    { label: "License",      value: "Proprietary"       },
                ].map(row => (
                    <div
                        key={row.label}
                        style={{
                            display:      "flex",
                            alignItems:   "center",
                            justifyContent: "space-between",
                            padding:      "8px 0",
                            borderBottom: "1px solid var(--color-border)",
                        }}
                    >
                        <span style={{ fontSize: "13.5px", color: "var(--color-text-muted)" }}>{row.label}</span>
                        <span style={{ fontSize: "13.5px", color: "var(--color-text)", fontWeight: 500 }}>{row.value}</span>
                    </div>
                ))}
                <div style={{ marginTop: "8px", fontSize: "12.5px", color: "var(--color-text-muted)" }}>
                    AN Dev Studio is an AI-powered Software Engineering Platform by AN GROUP.
                    Built on the 5-layer architecture defined in ARCH-002.
                </div>
            </div>
        </Card>
    );
}

// ---------------------------------------------------------------------------

function ToggleRow({
    label,
    description,
    defaultOn = false,
}: {
    label: string;
    description: string;
    defaultOn?: boolean;
}) {
    const [on, setOn] = useState(defaultOn);

    return (
        <div style={{
            display:      "flex",
            alignItems:   "center",
            justifyContent: "space-between",
            gap:          "16px",
            padding:      "10px 0",
            borderBottom: "1px solid var(--color-border)",
        }}>
            <div>
                <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--color-text)" }}>
                    {label}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    {description}
                </div>
            </div>
            <button
                onClick={() => setOn(v => !v)}
                style={{
                    width:        "42px",
                    height:       "24px",
                    borderRadius: "12px",
                    background:   on ? "var(--color-accent)" : "var(--color-border)",
                    border:       "none",
                    cursor:       "pointer",
                    position:     "relative",
                    flexShrink:   0,
                    transition:   "background 0.2s",
                }}
            >
                <span style={{
                    position:    "absolute",
                    top:         "3px",
                    left:        on ? "21px" : "3px",
                    width:       "18px",
                    height:      "18px",
                    borderRadius: "50%",
                    background:  "#fff",
                    transition:  "left 0.2s",
                    boxShadow:   "0 1px 3px rgba(0,0,0,0.2)",
                }} />
            </button>
        </div>
    );
}
