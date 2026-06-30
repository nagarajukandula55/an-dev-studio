"use client";

/**
 * ============================================================================
 * ANu Platform Guide
 * Floating AI assistant that provides contextual guidance on every page.
 * Knows where the user is and walks them through any process step-by-step.
 * ============================================================================
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
    role:    "user" | "anu";
    content: string;
    id:      string;
}

interface PageContext {
    title:       string;
    description: string;
    quickGuides: { label: string; prompt: string }[];
}

// ── Page-aware context ───────────────────────────────────────────────────────

const PAGE_CONTEXTS: Record<string, PageContext> = {
    "/": {
        title: "Dashboard",
        description: "You're on the main dashboard — the mission control for your entire platform.",
        quickGuides: [
            { label: "Create my first project", prompt: "Walk me through creating my first project step by step." },
            { label: "Set up AI providers",      prompt: "How do I configure my AI API keys so the platform works?" },
            { label: "Activate ANu locally",     prompt: "How do I set up ANu to run locally without API costs?" },
            { label: "What can I build here?",   prompt: "What types of applications can I build with AN Dev Studio?" },
        ],
    },
    "/projects": {
        title: "Projects",
        description: "Manage all your applications, websites, and modules from here.",
        quickGuides: [
            { label: "Create a new website",     prompt: "Guide me through creating a new website project." },
            { label: "Build a SaaS app",         prompt: "What steps do I follow to start building a SaaS application?" },
            { label: "Set up a mobile app",      prompt: "Walk me through creating a React Native mobile app project." },
            { label: "Build an ERP system",      prompt: "How do I start building an enterprise ERP system with AN Dev Studio?" },
        ],
    },
    "/projects/new": {
        title: "New Project",
        description: "You're creating a new project. I'll guide you through each step.",
        quickGuides: [
            { label: "Which type should I pick?", prompt: "Help me choose the right project type for my idea." },
            { label: "What tech stack for SaaS?", prompt: "What's the best tech stack for a SaaS application?" },
            { label: "Mobile app setup",          prompt: "What do I need to know before creating a mobile app project?" },
        ],
    },
    "/ai": {
        title: "AI Studio",
        description: "Your AI-powered development workspace with 7 specialized agents.",
        quickGuides: [
            { label: "Generate a full API",         prompt: "Guide me through using AI Studio to generate a complete REST API." },
            { label: "Review my code",              prompt: "How do I use the Reviewer agent to audit my code for issues?" },
            { label: "Write tests automatically",   prompt: "Show me how to auto-generate tests for my TypeScript functions." },
            { label: "Plan a new feature",          prompt: "Walk me through using the Planner agent to break down a new feature." },
        ],
    },
    "/workspace": {
        title: "Workspace",
        description: "Your development workspace — browse files, edit code, and collaborate with ANu.",
        quickGuides: [
            { label: "Edit a file with AI",         prompt: "How do I use the workspace to edit files with AI assistance?" },
            { label: "Run code review",             prompt: "How do I trigger a code review on my current workspace?" },
        ],
    },
    "/erp": {
        title: "ERP Module",
        description: "Enterprise Resource Planning — financial management, inventory, and operations.",
        quickGuides: [
            { label: "Set up chart of accounts", prompt: "Walk me through setting up the chart of accounts for my business." },
            { label: "Track inventory",          prompt: "How do I add products and track inventory levels?" },
            { label: "Generate financial reports", prompt: "How do I generate a P&L or balance sheet report?" },
        ],
    },
    "/crm": {
        title: "CRM Module",
        description: "Customer Relationship Management — contacts, deals, and pipeline.",
        quickGuides: [
            { label: "Import my contacts",      prompt: "How do I import contacts from a CSV into the CRM?" },
            { label: "Set up sales pipeline",   prompt: "Walk me through configuring my sales pipeline stages." },
            { label: "Track a deal",            prompt: "How do I create and track a new sales deal?" },
        ],
    },
    "/mobile": {
        title: "Mobile Builder",
        description: "AI-powered React Native app builder.",
        quickGuides: [
            { label: "Create my first screen",  prompt: "Guide me through creating my first mobile app screen." },
            { label: "Add navigation",          prompt: "How do I set up navigation between screens?" },
            { label: "Connect to an API",       prompt: "How do I connect my mobile app to a backend API?" },
        ],
    },
    "/settings": {
        title: "Settings",
        description: "Configure everything about your AN Dev Studio installation.",
        quickGuides: [
            { label: "Add my Groq API key",     prompt: "Guide me through adding my Groq API key in the Providers tab." },
            { label: "Set up ANu locally",      prompt: "How do I install and activate ANu to run offline?" },
            { label: "Deploy to Vercel",        prompt: "Walk me through deploying my app to Vercel from the Deployment tab." },
        ],
    },
};

function getPageContext(pathname: string): PageContext {
    if (PAGE_CONTEXTS[pathname]) return PAGE_CONTEXTS[pathname];
    // Partial match
    for (const [key, ctx] of Object.entries(PAGE_CONTEXTS)) {
        if (pathname.startsWith(key) && key !== "/") return ctx;
    }
    return {
        title: "AN Dev Studio",
        description: "I'm ANu, your AI guide. Ask me anything about the platform.",
        quickGuides: [
            { label: "What can I build?",           prompt: "What types of applications and systems can I build with AN Dev Studio?" },
            { label: "How does the AI work?",       prompt: "Explain how the 7-agent AI system works." },
            { label: "Getting started guide",       prompt: "Give me a complete getting started guide for AN Dev Studio." },
        ],
    };
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AnuGuide() {
    const pathname                   = usePathname();
    const [open, setOpen]            = useState(false);
    const [messages, setMessages]    = useState<Message[]>([]);
    const [input, setInput]          = useState("");
    const [streaming, setStreaming]  = useState(false);
    const [mounted, setMounted]      = useState(false);
    const [pulse, setPulse]          = useState(true);
    const bottomRef                  = useRef<HTMLDivElement>(null);
    const inputRef                   = useRef<HTMLInputElement>(null);
    const abortRef                   = useRef<AbortController | null>(null);
    const ctx                        = getPageContext(pathname);

    useEffect(() => {
        setMounted(true);
        // Stop pulsing after 8 seconds
        const t = setTimeout(() => setPulse(false), 8000);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (open) {
            // Contextual greeting when opening on a new page
            if (messages.length === 0) {
                setMessages([{
                    id:      "welcome",
                    role:    "anu",
                    content: `👋 Hi Nagaraj! I'm ANu, your platform guide.\n\nYou're in **${ctx.title}**. ${ctx.description}\n\nHow can I help you right now?`,
                }]);
            }
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset messages when navigating to a new page
    useEffect(() => {
        setMessages([]);
    }, [pathname]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || streaming) return;

        const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setStreaming(true);

        const anuMsgId = `a-${Date.now()}`;
        setMessages(prev => [...prev, { id: anuMsgId, role: "anu", content: "" }]);

        const ctrl = new AbortController();
        abortRef.current = ctrl;

        const systemContext = `You are ANu, the AI guide for AN Dev Studio — an AI-powered Software Engineering Platform by AN GROUP.

Current page: ${ctx.title}
Page description: ${ctx.description}

Your role is to guide Nagaraj through any process on this platform. Be warm, direct, and practical.
Format responses with clear steps when walking through a process.
Use markdown: **bold** for key terms, numbered lists for steps, backticks for code/commands.
Keep responses focused and actionable. Max 300 words unless the user asks for more detail.`;

        try {
            const res = await fetch("/api/chat", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                signal:  ctrl.signal,
                body:    JSON.stringify({
                    messages:  [
                        ...messages.slice(-6).map(m => ({ role: m.role === "anu" ? "assistant" : "user", content: m.content })),
                        { role: "user", content: text.trim() },
                    ],
                    agentType:    "orchestrator",
                    systemPrompt: systemContext,
                }),
            });

            if (!res.ok || !res.body) throw new Error("Failed");

            const reader = res.body.getReader();
            const dec    = new TextDecoder();
            let buf      = "";
            let full     = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop() ?? "";
                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    try {
                        const evt = JSON.parse(line.slice(6));
                        if (evt.type === "token" && evt.token) {
                            full += evt.token;
                            setMessages(prev => prev.map(m =>
                                m.id === anuMsgId ? { ...m, content: full } : m
                            ));
                        }
                    } catch { /* skip malformed */ }
                }
            }
        } catch (e: unknown) {
            if ((e as Error).name !== "AbortError") {
                setMessages(prev => prev.map(m =>
                    m.id === anuMsgId
                        ? { ...m, content: "Sorry, I couldn't reach the AI right now. Make sure you have an API key configured in **Settings → Providers**." }
                        : m
                ));
            }
        } finally {
            setStreaming(false);
            abortRef.current = null;
        }
    }, [streaming, messages, ctx]);

    if (!mounted) return null;

    return (
        <>
            {/* ── Floating button ─────────────────────────────────────────── */}
            <button
                onClick={() => setOpen(v => !v)}
                title="Ask ANu"
                data-anu-trigger
                style={{
                    position:     "fixed",
                    bottom:       "24px",
                    right:        "24px",
                    zIndex:       9999,
                    width:        "52px",
                    height:       "52px",
                    borderRadius: "50%",
                    background:   "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border:       "none",
                    cursor:       "pointer",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    fontSize:     "22px",
                    boxShadow:    open
                        ? "0 4px 20px rgba(99,102,241,0.5)"
                        : "0 4px 16px rgba(99,102,241,0.4)",
                    transform:    open ? "scale(0.95)" : "scale(1)",
                    transition:   "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                    outline:      "none",
                }}
            >
                {open ? "✕" : "🧠"}
                {/* Pulse ring */}
                {pulse && !open && (
                    <span style={{
                        position:     "absolute",
                        inset:        "-4px",
                        borderRadius: "50%",
                        border:       "2px solid #6366f1",
                        animation:    "anu-pulse 2s ease-out infinite",
                        pointerEvents: "none",
                    }} />
                )}
            </button>

            {/* ── Panel ───────────────────────────────────────────────────── */}
            <div style={{
                position:     "fixed",
                bottom:       "88px",
                right:        "24px",
                zIndex:       9998,
                width:        "min(400px, calc(100vw - 48px))",
                height:       "min(560px, calc(100vh - 120px))",
                background:   "var(--color-bg-surface, #ffffff)",
                border:       "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "18px",
                boxShadow:    "0 24px 64px rgba(0,0,0,0.18)",
                display:      "flex",
                flexDirection: "column",
                overflow:     "hidden",
                opacity:      open ? 1 : 0,
                transform:    open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
                pointerEvents: open ? "auto" : "none",
                transition:   "opacity 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            }}>

                {/* Header */}
                <div style={{
                    padding:     "14px 16px",
                    background:  "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display:     "flex",
                    alignItems:  "center",
                    gap:         "10px",
                    flexShrink:  0,
                }}>
                    <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: "rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "16px", flexShrink: 0,
                    }}>🧠</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>ANu Guide</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)" }}>
                            {ctx.title} · {streaming ? "Thinking…" : "Ready to help"}
                        </div>
                    </div>
                    <button
                        onClick={() => setMessages([])}
                        title="Clear chat"
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "12px", padding: "4px 8px", borderRadius: "6px" }}
                    >
                        Clear
                    </button>
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1, overflowY: "auto", padding: "12px 14px",
                    display: "flex", flexDirection: "column", gap: "10px",
                }}>
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} message={msg} streaming={streaming && msg.id === messages[messages.length - 1]?.id && msg.role === "anu"} />
                    ))}

                    {/* Quick guide buttons shown when no user messages yet */}
                    {messages.length <= 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                            <div style={{ fontSize: "11px", color: "var(--color-text-muted, #94a3b8)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
                                Quick guides
                            </div>
                            {ctx.quickGuides.map(g => (
                                <button
                                    key={g.label}
                                    onClick={() => sendMessage(g.prompt)}
                                    style={{
                                        textAlign:    "left",
                                        padding:      "9px 12px",
                                        borderRadius: "10px",
                                        border:       "1px solid var(--color-border, #e2e8f0)",
                                        background:   "var(--color-bg-subtle, #f8fafc)",
                                        color:        "var(--color-text, #0f172a)",
                                        fontSize:     "13px",
                                        cursor:       "pointer",
                                        transition:   "all 0.12s",
                                        display:      "flex",
                                        alignItems:   "center",
                                        gap:          "8px",
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = "color-mix(in srgb, #6366f1 8%, var(--color-bg-subtle, #f8fafc))";
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = "var(--color-bg-subtle, #f8fafc)";
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border, #e2e8f0)";
                                    }}
                                >
                                    <span style={{ fontSize: "14px" }}>→</span>
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{
                    padding:     "10px 12px",
                    borderTop:   "1px solid var(--color-border, #e2e8f0)",
                    display:     "flex",
                    gap:         "8px",
                    flexShrink:  0,
                    background:  "var(--color-bg-surface, #ffffff)",
                }}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                        placeholder="Ask ANu anything…"
                        disabled={streaming}
                        style={{
                            flex:         1,
                            padding:      "9px 12px",
                            borderRadius: "10px",
                            border:       "1px solid var(--color-border, #e2e8f0)",
                            background:   "var(--color-bg-subtle, #f8fafc)",
                            color:        "var(--color-text, #0f172a)",
                            fontSize:     "13px",
                            outline:      "none",
                            transition:   "border-color 0.15s",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
                        onBlur={e  => (e.currentTarget.style.borderColor = "var(--color-border, #e2e8f0)")}
                    />
                    <button
                        onClick={() => streaming ? abortRef.current?.abort() : sendMessage(input)}
                        style={{
                            padding:      "9px 14px",
                            borderRadius: "10px",
                            border:       "none",
                            background:   streaming ? "#ef4444" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            color:        "#fff",
                            fontSize:     "13px",
                            fontWeight:   600,
                            cursor:       "pointer",
                            flexShrink:   0,
                            transition:   "opacity 0.15s",
                        }}
                    >
                        {streaming ? "Stop" : "Send"}
                    </button>
                </div>
            </div>

            {/* Animation keyframes */}
            <style>{`
                @keyframes anu-pulse {
                    0%   { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.6); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0; }
                }
            `}</style>
        </>
    );
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message, streaming }: { message: Message; streaming: boolean }) {
    const isAnu = message.role === "anu";

    // Simple markdown renderer: bold, code, numbered lists
    function renderMarkdown(text: string): string {
        return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/`([^`]+)`/g, "<code style='background:rgba(99,102,241,0.1);padding:1px 5px;border-radius:4px;font-size:11.5px;font-family:monospace'>$1</code>")
            .replace(/^(\d+)\. (.+)$/gm, "<div style='margin:3px 0;padding-left:4px'><strong>$1.</strong> $2</div>")
            .replace(/\n/g, "<br/>");
    }

    return (
        <div style={{
            display:    "flex",
            gap:        "8px",
            alignItems: "flex-start",
            flexDirection: isAnu ? "row" : "row-reverse",
        }}>
            {isAnu && (
                <div style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", flexShrink: 0, marginTop: "2px",
                }}>
                    🧠
                </div>
            )}
            <div style={{
                maxWidth:     "85%",
                padding:      "9px 12px",
                borderRadius: isAnu ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                background:   isAnu
                    ? "var(--color-bg-subtle, #f8fafc)"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color:        isAnu ? "var(--color-text, #0f172a)" : "#ffffff",
                fontSize:     "13px",
                lineHeight:   1.55,
                border:       isAnu ? "1px solid var(--color-border, #e2e8f0)" : "none",
            }}>
                {isAnu ? (
                    <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
                ) : (
                    message.content
                )}
                {streaming && (
                    <span style={{
                        display:      "inline-block",
                        width:        "6px",
                        height:       "14px",
                        background:   "#6366f1",
                        marginLeft:   "3px",
                        borderRadius: "2px",
                        animation:    "blink 1s step-end infinite",
                        verticalAlign: "middle",
                    }} />
                )}
            </div>
        </div>
    );
}
