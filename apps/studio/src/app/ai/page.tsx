"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

// ── Types ────────────────────────────────────────────────────────────────────

interface ModelInfo {
    id: string;
    name: string;
    free: boolean;
    description: string;
}

interface ProviderStatus {
    name: string;
    label: string;
    configured: boolean;
    models: ModelInfo[];
    defaultModel: string;
}

interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    provider?: string;
    model?: string;
    isFallback?: boolean;
    isStreaming?: boolean;
    isError?: boolean;
}

// ── Agent config ─────────────────────────────────────────────────────────────

const AGENTS = [
    { name: "Orchestrator", icon: "⚡", color: "#3b66ff",  desc: "Coordinates all agents" },
    { name: "Architect",    icon: "🏛",  color: "#8b5cf6",  desc: "System design" },
    { name: "Planner",      icon: "📋", color: "#06b6d4",  desc: "Task breakdown" },
    { name: "Developer",    icon: "💻", color: "#10b981",  desc: "Code generation" },
    { name: "QA",           icon: "🧪", color: "#f59e0b",  desc: "Testing" },
    { name: "Reviewer",     icon: "🔍", color: "#ef4444",  desc: "Code review" },
    { name: "DevOps",       icon: "🚀", color: "#ec4899",  desc: "CI/CD & infra" },
];

// ── Provider Switcher ─────────────────────────────────────────────────────────

function ProviderSwitcher({
    providers,
    active,
    activeModel,
    onSelect,
}: {
    providers: ProviderStatus[];
    active: string;
    activeModel: string;
    onSelect: (provider: string, model: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const current = providers.find(p => p.name === active);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "5px 10px", borderRadius: "8px",
                    border: "1px solid var(--color-border)", background: "var(--color-bg-surface)",
                    color: "var(--color-text)", fontSize: "12px", fontWeight: 500,
                    cursor: "pointer", whiteSpace: "nowrap",
                }}
            >
                <span style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: current?.configured ? "#10b981" : "#6b7280", flexShrink: 0,
                }} />
                {current?.label ?? active}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0, width: "320px",
                    background: "var(--color-bg-surface)", border: "1px solid var(--color-border)",
                    borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    zIndex: 100, overflow: "hidden",
                }}>
                    <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--color-border)" }}>
                        <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            AI Provider &amp; Model
                        </p>
                    </div>
                    {providers.map(p => (
                        <div key={p.name} style={{ padding: "8px 14px", borderBottom: "1px solid var(--color-border)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>
                                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0, background: p.configured ? "#10b981" : "#6b7280" }} />
                                    {p.label}
                                </span>
                                {!p.configured && (
                                    <span style={{ fontSize: "10px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "1px 6px", borderRadius: "4px" }}>
                                        No API key
                                    </span>
                                )}
                            </div>
                            {p.configured && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                    {p.models.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => { onSelect(p.name, m.id); setOpen(false); }}
                                            style={{
                                                padding: "3px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer",
                                                border: `1px solid ${active === p.name && activeModel === m.id ? "var(--color-accent)" : "var(--color-border)"}`,
                                                background: active === p.name && activeModel === m.id ? "var(--color-accent)" : "transparent",
                                                color: active === p.name && activeModel === m.id ? "#fff" : "var(--color-text-muted)",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {m.name}{m.free && <span style={{ marginLeft: "3px", opacity: 0.7 }}>·free</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <div style={{ padding: "8px 14px" }}>
                        <a href="/settings" style={{ fontSize: "11px", color: "var(--color-accent)", textDecoration: "none" }}>
                            Manage API keys in Settings →
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg, agentColor }: { msg: Message; agentColor: string }) {
    const isUser = msg.role === "user";

    if (msg.role === "system") {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                <span style={{
                    fontSize: "11.5px", color: msg.isError ? "#ef4444" : "var(--color-text-muted)",
                    background: msg.isError ? "rgba(239,68,68,0.08)" : "var(--color-bg-subtle)",
                    padding: "4px 12px", borderRadius: "20px", fontStyle: "italic",
                }}>
                    {msg.content}
                </span>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: "12px" }}>
            {!isUser && (
                <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", background: agentColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", flexShrink: 0, marginRight: "8px", marginTop: "2px",
                }}>
                    🤖
                </div>
            )}
            <div style={{ maxWidth: "75%", minWidth: 0 }}>
                <div style={{
                    padding: "10px 14px",
                    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isUser ? "var(--color-accent)" : "var(--color-bg-surface)",
                    border: isUser ? "none" : "1px solid var(--color-border)",
                    color: isUser ? "#fff" : "var(--color-text)",
                    fontSize: "13.5px", lineHeight: 1.65,
                    wordBreak: "break-word", whiteSpace: "pre-wrap",
                }}>
                    {msg.content}
                    {msg.isStreaming && (
                        <span style={{
                            display: "inline-block", width: "2px", height: "14px",
                            background: "currentColor", marginLeft: "2px", verticalAlign: "middle",
                            animation: "blink 1s step-end infinite",
                        }} />
                    )}
                </div>
                {!isUser && msg.provider && !msg.isStreaming && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", paddingLeft: "4px" }}>
                        <span style={{ fontSize: "10.5px", color: "var(--color-text-muted)" }}>
                            {msg.provider} · {msg.model}
                        </span>
                        {msg.isFallback && (
                            <span style={{ fontSize: "10px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "1px 5px", borderRadius: "3px" }}>
                                fallback
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AIStudioPage() {
    const [activeAgent,     setActiveAgent]    = useState("Orchestrator");
    const [messages,        setMessages]       = useState<Message[]>([]);
    const [input,           setInput]          = useState("");
    const [isStreaming,     setIsStreaming]     = useState(false);
    const [providers,       setProviders]      = useState<ProviderStatus[]>([]);
    const [activeProvider,  setActiveProvider] = useState("groq");
    const [activeModel,     setActiveModel]    = useState("");
    const [sidebarOpen,     setSidebarOpen]    = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef       = useRef<AbortController | null>(null);
    const textareaRef    = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetch("/api/providers")
            .then(r => r.json())
            .then((data: { providers: ProviderStatus[]; default: string }) => {
                setProviders(data.providers);
                const saved = typeof window !== "undefined" ? localStorage.getItem("studio-provider") : null;
                const def   = saved ?? data.default ?? "groq";
                setActiveProvider(def);
                const prov      = data.providers.find(p => p.name === def);
                const savedMdl  = typeof window !== "undefined" ? localStorage.getItem(`studio-model-${def}`) : null;
                setActiveModel(savedMdl ?? prov?.defaultModel ?? "");
            })
            .catch(() => setProviders([]));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const agentConfig = AGENTS.find(a => a.name === activeAgent) ?? AGENTS[0];

    const handleProviderSelect = useCallback((provider: string, model: string) => {
        setActiveProvider(provider);
        setActiveModel(model);
        localStorage.setItem("studio-provider", provider);
        localStorage.setItem(`studio-model-${provider}`, model);
    }, []);

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || isStreaming) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsStreaming(true);
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        const assistantId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "", isStreaming: true }]);

        const history = messages
            .filter(m => m.role !== "system")
            .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

        abortRef.current = new AbortController();

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages:  [...history, { role: "user", content: text }],
                    agentType: activeAgent,
                    provider:  activeProvider,
                    model:     activeModel,
                }),
                signal: abortRef.current.signal,
            });

            if (!response.ok || !response.body) throw new Error(`Server error ${response.status}`);

            const reader  = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let finalProvider = activeProvider;
            let finalModel    = activeModel;
            let isFallback    = false;

            outer: while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) continue;
                    const raw = trimmed.slice(5).trim();
                    if (!raw) continue;

                    try {
                        const evt = JSON.parse(raw) as {
                            type: string; token?: string; provider?: string; model?: string;
                            isFallback?: boolean; switchingFrom?: string; switchingTo?: string; error?: string;
                        };

                        if (evt.type === "token" && evt.token) {
                            setMessages(prev => prev.map(m =>
                                m.id === assistantId ? { ...m, content: m.content + (evt.token ?? "") } : m,
                            ));
                        } else if (evt.type === "provider_switch") {
                            isFallback = true;
                            const notif: Message = {
                                id: `sw-${Date.now()}`, role: "system",
                                content: `⚡ ${evt.switchingFrom} unavailable — switching to ${evt.switchingTo}…`,
                            };
                            setMessages(prev => [
                                ...prev.filter(m => m.id !== assistantId),
                                notif,
                                { id: assistantId, role: "assistant", content: "", isStreaming: true },
                            ]);
                        } else if (evt.type === "meta") {
                            finalProvider = evt.provider ?? activeProvider;
                            finalModel    = evt.model    ?? activeModel;
                            isFallback    = evt.isFallback ?? false;
                        } else if (evt.type === "error") {
                            throw new Error(evt.error ?? "Unknown AI error");
                        } else if (evt.type === "done") {
                            break outer;
                        }
                    } catch (pe) {
                        if (pe instanceof SyntaxError) continue;
                        throw pe;
                    }
                }
            }

            setMessages(prev => prev.map(m =>
                m.id === assistantId
                    ? { ...m, isStreaming: false, provider: finalProvider, model: finalModel, isFallback }
                    : m,
            ));
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                setMessages(prev => prev.map(m =>
                    m.id === assistantId ? { ...m, isStreaming: false, content: m.content + " [stopped]" } : m,
                ));
            } else {
                const errMsg = err instanceof Error ? err.message : "Unknown error";
                setMessages(prev => [
                    ...prev.filter(m => m.id !== assistantId),
                    { id: assistantId, role: "system", content: `❌ ${errMsg}`, isError: true },
                ]);
            }
        } finally {
            setIsStreaming(false);
            abortRef.current = null;
        }
    }, [input, isStreaming, messages, activeAgent, activeProvider, activeModel]);

    const stopStreaming = useCallback(() => { abortRef.current?.abort(); }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    }, [sendMessage]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
    };

    const configuredProviders = providers.filter(p => p.configured);

    return (
        <AppShell title="AI Studio">
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            <div style={{ display: "flex", height: "calc(100vh - 120px)", gap: "16px", minHeight: 0 }}>

                {/* Agent sidebar */}
                {sidebarOpen && (
                    <div style={{
                        width: "200px", flexShrink: 0,
                        background: "var(--color-bg-surface)", border: "1px solid var(--color-border)",
                        borderRadius: "12px", padding: "12px 8px",
                        display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto",
                    }}>
                        <p style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px", margin: "0 0 8px" }}>
                            Agents
                        </p>
                        {AGENTS.map(agent => (
                            <button
                                key={agent.name}
                                onClick={() => setActiveAgent(agent.name)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    padding: "7px 10px", borderRadius: "8px", border: "none",
                                    background: activeAgent === agent.name
                                        ? `color-mix(in srgb, ${agent.color} 15%, transparent)` : "transparent",
                                    color: activeAgent === agent.name ? agent.color : "var(--color-text-muted)",
                                    fontSize: "13px", fontWeight: activeAgent === agent.name ? 600 : 400,
                                    cursor: "pointer", textAlign: "left", width: "100%",
                                }}
                            >
                                <span style={{ fontSize: "15px" }}>{agent.icon}</span>
                                <div>
                                    <div style={{ lineHeight: 1.2 }}>{agent.name}</div>
                                    <div style={{ fontSize: "10.5px", opacity: 0.7, marginTop: "1px" }}>{agent.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Chat area */}
                <div style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    background: "var(--color-bg-surface)", border: "1px solid var(--color-border)",
                    borderRadius: "12px", overflow: "hidden", minWidth: 0,
                }}>
                    {/* Toolbar */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 16px", borderBottom: "1px solid var(--color-border)",
                        flexShrink: 0, gap: "8px", flexWrap: "wrap",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "2px" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                                </svg>
                            </button>
                            <div style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                padding: "4px 10px", borderRadius: "8px",
                                background: `color-mix(in srgb, ${agentConfig.color} 12%, transparent)`,
                                border: `1px solid color-mix(in srgb, ${agentConfig.color} 30%, transparent)`,
                            }}>
                                <span>{agentConfig.icon}</span>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: agentConfig.color }}>
                                    {agentConfig.name}Agent
                                </span>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {configuredProviders.length === 0 && (
                                <span style={{ fontSize: "11.5px", color: "#f59e0b" }}>
                                    ⚠ No providers configured —{" "}
                                    <a href="/settings" style={{ color: "var(--color-accent)", textDecoration: "none" }}>add API keys</a>
                                </span>
                            )}
                            {providers.length > 0 && (
                                <ProviderSwitcher
                                    providers={providers}
                                    active={activeProvider}
                                    activeModel={activeModel}
                                    onSelect={handleProviderSelect}
                                />
                            )}
                            {messages.length > 0 && (
                                <button
                                    onClick={() => setMessages([])}
                                    style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-muted)", fontSize: "12px", cursor: "pointer" }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column" }}>
                        {messages.length === 0 ? (
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", opacity: 0.5 }}>
                                <span style={{ fontSize: "48px" }}>{agentConfig.icon}</span>
                                <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--color-text)" }}>
                                    {agentConfig.name}Agent ready
                                </p>
                                <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)", textAlign: "center", maxWidth: "320px" }}>
                                    {agentConfig.desc}. Send a message to get started.
                                </p>
                            </div>
                        ) : (
                            messages.map(msg => <MessageBubble key={msg.id} msg={msg} agentColor={agentConfig.color} />)
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border)", flexShrink: 0 }}>
                        <div style={{
                            display: "flex", gap: "8px", alignItems: "flex-end",
                            background: "var(--color-bg-subtle)", border: "1px solid var(--color-border)",
                            borderRadius: "12px", padding: "8px 8px 8px 14px",
                        }}>
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={handleTextareaChange}
                                onKeyDown={handleKeyDown}
                                placeholder={`Message ${agentConfig.name}Agent… (Enter to send, Shift+Enter for newline)`}
                                disabled={isStreaming}
                                rows={1}
                                style={{
                                    flex: 1, background: "transparent", border: "none", outline: "none",
                                    resize: "none", color: "var(--color-text)", fontSize: "13.5px",
                                    lineHeight: 1.6, fontFamily: "inherit", maxHeight: "160px", overflowY: "auto",
                                }}
                            />
                            {isStreaming ? (
                                <button onClick={stopStreaming} title="Stop" style={{
                                    width: "34px", height: "34px", borderRadius: "8px", border: "none",
                                    background: "#ef4444", color: "#fff", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                                </button>
                            ) : (
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || configuredProviders.length === 0}
                                    title="Send (Enter)"
                                    style={{
                                        width: "34px", height: "34px", borderRadius: "8px", border: "none",
                                        background: input.trim() && configuredProviders.length > 0 ? "var(--color-accent)" : "var(--color-bg-surface)",
                                        color: input.trim() && configuredProviders.length > 0 ? "#fff" : "var(--color-text-muted)",
                                        cursor: input.trim() && configuredProviders.length > 0 ? "pointer" : "not-allowed",
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "11px", color: "var(--color-text-muted)", textAlign: "center" }}>
                            Auto-fallback enabled · {configuredProviders.length} provider{configuredProviders.length !== 1 ? "s" : ""} configured
                        </p>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
