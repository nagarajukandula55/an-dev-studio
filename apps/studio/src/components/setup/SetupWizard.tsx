"use client";

// ============================================================================
// AN Dev Studio — First-run Setup Wizard
//
// If no AI provider is configured yet, every agent call (chat, the
// core-team agents) fails with "No AI providers are configured." — a
// confusing dead end for a brand-new user. This shows a full-screen wizard
// instead: enable the local ANu provider via the existing setup scripts, or
// paste a free Groq API key, right from first launch.
//
// "Skip for now" dismisses for the current browser session only
// (sessionStorage) — it reappears on the next fresh session until a
// provider is actually configured, since an agent call will just fail
// again otherwise.
// ============================================================================

import { useEffect, useState } from "react";

const DISMISS_KEY = "an-dev-studio-setup-wizard-dismissed";

interface ProviderStatus {
    name: string;
    configured: boolean;
}

export function SetupWizard() {
    const [loading, setLoading] = useState(true);
    const [hasProvider, setHasProvider] = useState(true); // optimistic default — don't flash the wizard while checking
    const [dismissed, setDismissed] = useState(false);
    const [groqKey, setGroqKey] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isWindows, setIsWindows] = useState(false);

    const checkProviders = () => {
        fetch("/api/providers")
            .then((r) => (r.ok ? r.json() : null))
            .then((data: { providers: ProviderStatus[] } | null) => {
                setHasProvider(!!data?.providers?.some((p) => p.configured));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
        setIsWindows(navigator.userAgent.toLowerCase().includes("win"));
        checkProviders();
    }, []);

    const handleSaveGroqKey = async () => {
        if (!groqKey.trim()) {
            setSaveError("Enter a Groq API key first.");
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "GROQ_API_KEY", value: groqKey.trim() }),
            });
            if (res.ok) {
                checkProviders();
            } else {
                setSaveError("Failed to save the key — check it and try again.");
            }
        } catch {
            setSaveError("Network error.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || hasProvider || dismissed) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: "rgba(15, 23, 42, 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
        >
            <div
                style={{
                    width: "min(560px, 100%)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    background: "var(--surface, #ffffff)",
                    borderRadius: 16,
                    padding: 32,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                }}
            >
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", color: "var(--foreground, #0f172a)" }}>
                    Let&apos;s connect an AI provider
                </h2>
                <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--muted, #64748b)", lineHeight: 1.6 }}>
                    AN Dev Studio needs at least one AI provider before it can plan or generate anything. Pick whichever is
                    easiest for you — you can always add more later in Settings → Providers.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ border: "1.5px solid var(--border, #e2e8f0)", borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>🧠 Option A — Enable ANu (local, private, free)</div>
                        <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--muted, #64748b)", lineHeight: 1.6 }}>
                            Runs entirely on your machine via Ollama — your code never leaves your computer. Run this once from
                            the repo root:
                        </p>
                        <pre
                            style={{
                                background: "#0f172a",
                                color: "#e2e8f0",
                                padding: 12,
                                borderRadius: 8,
                                fontSize: 12,
                                margin: 0,
                                overflowX: "auto",
                            }}
                        >
                            {isWindows ? ".\\anu\\setup.ps1" : "./anu/setup.sh"}
                        </pre>
                        <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--muted, #64748b)" }}>
                            Then set <code>OLLAMA_ENABLED=true</code> in <code>.env.local</code> and restart the dev server.
                        </p>
                    </div>

                    <div style={{ border: "1.5px solid var(--border, #e2e8f0)", borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>☁️ Option B — Paste a free Groq API key</div>
                        <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--muted, #64748b)", lineHeight: 1.6 }}>
                            Groq has a generous free tier and takes about a minute to set up.{" "}
                            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1" }}>
                                Get a free key →
                            </a>
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                type="password"
                                placeholder="gsk_..."
                                value={groqKey}
                                onChange={(e) => setGroqKey(e.target.value)}
                                style={{
                                    flex: 1,
                                    height: 36,
                                    padding: "0 12px",
                                    borderRadius: 8,
                                    border: "1.5px solid var(--border, #e2e8f0)",
                                    background: "var(--background, #f8fafc)",
                                    fontSize: 13,
                                    outline: "none",
                                }}
                            />
                            <button
                                onClick={() => void handleSaveGroqKey()}
                                disabled={saving}
                                style={{
                                    padding: "0 16px",
                                    height: 36,
                                    borderRadius: 8,
                                    border: "none",
                                    background: saving ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    color: saving ? "#94a3b8" : "#ffffff",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: saving ? "not-allowed" : "pointer",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {saving ? "Saving…" : "Save & connect"}
                            </button>
                        </div>
                        {saveError && <div style={{ marginTop: 8, fontSize: 12, color: "#dc2626" }}>{saveError}</div>}
                    </div>
                </div>

                <button
                    onClick={() => {
                        sessionStorage.setItem(DISMISS_KEY, "1");
                        setDismissed(true);
                    }}
                    style={{
                        marginTop: 20,
                        background: "none",
                        border: "none",
                        color: "var(--muted, #64748b)",
                        fontSize: 13,
                        cursor: "pointer",
                        textDecoration: "underline",
                    }}
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
}
