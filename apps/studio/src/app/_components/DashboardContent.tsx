"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ActivityEntry {
  id: string;
  message: string;
  time: string;
  agent: string;
  status: "success" | "warning" | "danger";
  category: string;
}

interface Provider {
  id: string;
  name: string;
  configured: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function Skeleton({ width, height = 20, radius = 6 }: { width?: string | number; height?: number; radius?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: width ?? "100%",
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, var(--color-surface-2, #f1f5f9) 25%, var(--color-surface-3, #e2e8f0) 50%, var(--color-surface-2, #f1f5f9) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s ease-in-out infinite",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number | null;
  icon: string;
  iconGradient: string;
  loading: boolean;
  href?: string;
}

function StatCard({ label, value, icon, iconGradient, loading, href }: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  const inner = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--color-surface, #ffffff)",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        borderColor: hovered ? "var(--color-primary, #6366f1)" : "var(--color-border, #e2e8f0)",
        cursor: href ? "pointer" : "default",
        textDecoration: "none",
        color: "inherit",
        flex: "1 1 0",
        minWidth: 160,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: iconGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-muted, #64748b)",
            marginBottom: 4,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text, #0f172a)", lineHeight: 1 }}>
          {loading ? <Skeleton width={48} height={28} /> : value ?? "—"}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: "none", flex: "1 1 0", minWidth: 160, display: "block" }}>{inner}</Link>;
  }
  return inner;
}

// ---------------------------------------------------------------------------
// Quick action card
// ---------------------------------------------------------------------------

interface QuickActionProps {
  href: string;
  icon: string;
  gradient: string;
  title: string;
  description: string;
}

function QuickAction({ href, icon, gradient, title, description }: QuickActionProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--color-surface, #ffffff)",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: 14,
        padding: "20px 20px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
        boxShadow: hovered ? "0 10px 30px rgba(99,102,241,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : "none",
        borderColor: hovered ? "var(--color-primary, #6366f1)" : "var(--color-border, #e2e8f0)",
        flex: "1 1 0",
        minWidth: 140,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text, #0f172a)", marginBottom: 2 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted, #64748b)", lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Activity item
// ---------------------------------------------------------------------------

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  const dotColor =
    entry.status === "success" ? "#22c55e"
    : entry.status === "warning" ? "#f59e0b"
    : "#ef4444";

  const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border-subtle, #f1f5f9)",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
          marginTop: 6,
          boxShadow: `0 0 0 3px ${dotColor}22`,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--color-text, #0f172a)", lineHeight: 1.4 }}>
          {entry.message}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-muted, #94a3b8)", marginTop: 2 }}>
          {entry.agent} · {timeAgo(entry.time)}
        </div>
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: 999,
          background: `${dotColor}18`,
          color: dotColor,
          flexShrink: 0,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {entry.status}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agent panel item
// ---------------------------------------------------------------------------

interface Agent {
  name: string;
  emoji: string;
  role: string;
  description: string;
  gradient: string;
}

const AGENTS: Agent[] = [
  { name: "CodeAgent",    emoji: "⚙️",  role: "Code Generation",   description: "Writes, refactors, and explains code in any language",        gradient: "linear-gradient(135deg, #6366f1, #4f46e5)" },
  { name: "ReviewAgent",  emoji: "🔍",  role: "Code Review",       description: "Audits diffs for bugs, style, and security issues",           gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
  { name: "DocAgent",     emoji: "📝",  role: "Documentation",     description: "Generates docs, comments, READMEs, and changelogs",           gradient: "linear-gradient(135deg, #06b6d4, #0891b2)" },
  { name: "TestAgent",    emoji: "🧪",  role: "Test Generation",   description: "Creates unit, integration, and e2e test suites",              gradient: "linear-gradient(135deg, #22c55e, #16a34a)" },
  { name: "DeployAgent",  emoji: "🚀",  role: "Deployment",        description: "Runs CI/CD pipelines, Docker builds, and cloud deploys",      gradient: "linear-gradient(135deg, #f97316, #ea580c)" },
  { name: "SearchAgent",  emoji: "🌐",  role: "Web Research",      description: "Searches, scrapes, and synthesizes information from the web", gradient: "linear-gradient(135deg, #ec4899, #db2777)" },
  { name: "ANu",          emoji: "🧠",  role: "Core Orchestrator", description: "Routes tasks, manages context, and coordinates all agents",   gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
];

function AgentRow({ agent }: { agent: Agent }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 10,
        transition: "background 0.15s",
        background: hovered ? "var(--color-surface-2, #f8fafc)" : "transparent",
        cursor: "default",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: agent.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {agent.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text, #0f172a)" }}>
            {agent.name}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--color-text-muted, #64748b)",
              background: "var(--color-surface-2, #f1f5f9)",
              borderRadius: 999,
              padding: "1px 7px",
            }}
          >
            {agent.role}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-muted, #94a3b8)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {agent.description}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 0 3px #22c55e33",
            display: "inline-block",
            animation: "pulse-dot 2s ease-in-out infinite",
          }}
        />
        <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>ready</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider pill
// ---------------------------------------------------------------------------

function ProviderPill({ name, configured }: { name: string; configured: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/settings#providers"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid var(--color-border, #e2e8f0)",
        background: hovered ? "var(--color-surface-2, #f8fafc)" : "var(--color-surface, #ffffff)",
        textDecoration: "none",
        color: "var(--color-text, #0f172a)",
        fontSize: 12,
        fontWeight: 600,
        transition: "background 0.15s, border-color 0.15s",
        borderColor: hovered ? "var(--color-primary, #6366f1)" : "var(--color-border, #e2e8f0)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: configured ? "#22c55e" : "#94a3b8",
          flexShrink: 0,
        }}
      />
      {name}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--color-text, #0f172a)", letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card wrapper
// ---------------------------------------------------------------------------

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--color-surface, #ffffff)",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: 14,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live pulse badge
// ---------------------------------------------------------------------------

function LiveBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 700,
        color: "#22c55e",
        background: "#22c55e18",
        padding: "2px 8px",
        borderRadius: 999,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#22c55e",
          display: "inline-block",
          animation: "pulse-dot 1.5s ease-in-out infinite",
        }}
      />
      Live
    </span>
  );
}

// ---------------------------------------------------------------------------
// ANu Companion Widget
// ---------------------------------------------------------------------------

function AnuWidget() {
  const [hovered, setHovered] = useState(false);
  const [inputHovered, setInputHovered] = useState(false);

  return (
    <Panel
      style={{
        background: hovered
          ? "linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%)"
          : "var(--color-surface, #ffffff)",
        borderColor: hovered ? "#a78bfa" : "var(--color-border, #e2e8f0)",
        borderWidth: 1.5,
        transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        boxShadow: hovered ? "0 8px 32px rgba(167,139,250,0.2), 0 0 0 3px #a78bfa22" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ display: "flex", alignItems: "center", gap: 16 }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f59e0b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            flexShrink: 0,
            boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
          }}
        >
          🧠
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text, #0f172a)", letterSpacing: "-0.02em" }}>
              ANu
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#7c3aed",
                background: "#7c3aed18",
                padding: "1px 7px",
                borderRadius: 999,
              }}
            >
              AI Companion
            </span>
          </div>
          <Link
            href="/ai"
            onMouseEnter={() => setInputHovered(true)}
            onMouseLeave={() => setInputHovered(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1.5px solid ${inputHovered ? "#a78bfa" : "#e2e8f0"}`,
              background: inputHovered ? "#faf5ff" : "var(--color-surface-2, #f8fafc)",
              textDecoration: "none",
              color: "var(--color-text-muted, #94a3b8)",
              fontSize: 14,
              transition: "border-color 0.2s, background 0.2s",
              cursor: "text",
            }}
          >
            <span style={{ fontSize: 16 }}>✨</span>
            <span>Ask ANu anything...</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 600,
                color: "#7c3aed",
                background: "#7c3aed18",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              Open Studio →
            </span>
          </Link>
        </div>
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Main DashboardContent
// ---------------------------------------------------------------------------

export default function DashboardContent() {
  // Clock — initialize to "" to avoid hydration mismatch
  const [clock, setClock] = useState("");
  // Greeting — computed client-side only
  const [greeting, setGreeting] = useState("");
  const [formattedDate, setFormattedDate] = useState("");

  // Live stats
  const [activeProjects, setActiveProjects] = useState<number | null>(null);
  const [totalTasks, setTotalTasks] = useState<number | null>(null);
  const [configuredProviders, setConfiguredProviders] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Activity feed
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Providers list
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);

  // -- Clock & greeting (client-side only)
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    setFormattedDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  // -- Stats fetch
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [projRes, actRes] = await Promise.allSettled([
        fetch("/api/projects?status=active"),
        fetch("/api/activity?limit=50"),
      ]);

      if (projRes.status === "fulfilled" && projRes.value.ok) {
        const data = await projRes.value.json();
        setActiveProjects(data.total ?? 0);
      } else {
        setActiveProjects(0);
      }

      if (actRes.status === "fulfilled" && actRes.value.ok) {
        const data = await actRes.value.json();
        setTotalTasks(data.total ?? 0);
      } else {
        setTotalTasks(0);
      }
    } catch {
      setActiveProjects(0);
      setTotalTasks(0);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchProviders = useCallback(async () => {
    setProvidersLoading(true);
    try {
      const res = await fetch("/api/providers");
      if (res.ok) {
        const data = await res.json();
        const list: Provider[] = Array.isArray(data.providers)
          ? data.providers
          : Array.isArray(data)
          ? data
          : [];
        setProviders(list);
        setConfiguredProviders(list.filter((p) => p.configured).length);
      } else {
        // Fallback: show default provider names with grey dots
        const defaults: Provider[] = [
          { id: "groq", name: "Groq", configured: false },
          { id: "cerebras", name: "Cerebras", configured: false },
          { id: "together", name: "Together", configured: false },
          { id: "openrouter", name: "OpenRouter", configured: false },
          { id: "anu", name: "ANu", configured: false },
        ];
        setProviders(defaults);
        setConfiguredProviders(0);
      }
    } catch {
      const defaults: Provider[] = [
        { id: "groq", name: "Groq", configured: false },
        { id: "cerebras", name: "Cerebras", configured: false },
        { id: "together", name: "Together", configured: false },
        { id: "openrouter", name: "OpenRouter", configured: false },
        { id: "anu", name: "ANu", configured: false },
      ];
      setProviders(defaults);
      setConfiguredProviders(0);
    } finally {
      setProvidersLoading(false);
    }
  }, []);

  // -- Activity fetch
  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/activity?limit=10");
      if (res.ok) {
        const data = await res.json();
        setActivities(Array.isArray(data.activities) ? data.activities : []);
      }
    } catch {
      // silently keep existing activities
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchProviders();
    fetchActivity();
  }, [fetchStats, fetchProviders, fetchActivity]);

  // Auto-refresh activity every 30s
  useEffect(() => {
    const id = setInterval(fetchActivity, 30_000);
    return () => clearInterval(id);
  }, [fetchActivity]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "28px 24px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* ------------------------------------------------------------------ */}
        {/* HEADER — greeting + clock                                           */}
        {/* ------------------------------------------------------------------ */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 800,
                color: "var(--color-text, #0f172a)",
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
              }}
            >
              {greeting ? `${greeting}, Nagaraj 👋` : <Skeleton width={280} height={32} />}
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 14,
                color: "var(--color-text-muted, #64748b)",
              }}
            >
              {formattedDate || <Skeleton width={220} height={18} />}
            </p>
          </div>

          {/* Live clock */}
          <div
            style={{
              background: "var(--color-surface, #ffffff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: 12,
              padding: "10px 18px",
              textAlign: "right",
              minWidth: 130,
            }}
          >
            <div
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--color-text, #0f172a)",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              {clock || "—"}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted, #94a3b8)", marginTop: 3, fontWeight: 500 }}>
              LOCAL TIME
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* LIVE STATS                                                          */}
        {/* ------------------------------------------------------------------ */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <StatCard
            label="Active Projects"
            value={activeProjects}
            icon="📁"
            iconGradient="linear-gradient(135deg, #6366f1, #4f46e5)"
            loading={statsLoading}
            href="/projects"
          />
          <StatCard
            label="Total Activities"
            value={totalTasks}
            icon="⚡"
            iconGradient="linear-gradient(135deg, #f59e0b, #d97706)"
            loading={statsLoading}
          />
          <StatCard
            label="AI Providers"
            value={configuredProviders === null ? null : `${configuredProviders} active`}
            icon="🤖"
            iconGradient="linear-gradient(135deg, #06b6d4, #0891b2)"
            loading={statsLoading}
            href="/settings#providers"
          />
          <StatCard
            label="Agents Online"
            value="7 / 7"
            icon="🧠"
            iconGradient="linear-gradient(135deg, #22c55e, #16a34a)"
            loading={false}
            href="/ai"
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* QUICK ACTIONS                                                       */}
        {/* ------------------------------------------------------------------ */}
        <div>
          <SectionHeader title="Quick Actions" />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <QuickAction
              href="/projects/new"
              icon="➕"
              gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
              title="New Project"
              description="Scaffold a new project with AI"
            />
            <QuickAction
              href="/ai"
              icon="🧠"
              gradient="linear-gradient(135deg, #7c3aed, #db2777)"
              title="AI Studio"
              description="Chat with ANu and all agents"
            />
            <QuickAction
              href="/ai?agent=reviewer"
              icon="🔍"
              gradient="linear-gradient(135deg, #8b5cf6, #6366f1)"
              title="Code Review"
              description="Let ReviewAgent audit your code"
            />
            <QuickAction
              href="/workspace"
              icon="🚀"
              gradient="linear-gradient(135deg, #f97316, #ef4444)"
              title="Deploy"
              description="Run a deployment pipeline now"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MIDDLE ROW — Activity + Agents                                     */}
        {/* ------------------------------------------------------------------ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Recent Activity */}
          <Panel>
            <SectionHeader
              title="Recent Activity"
              action={<LiveBadge />}
            />
            {activityLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Skeleton width={8} height={8} radius={999} />
                    <Skeleton height={14} />
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: "var(--color-text-muted, #94a3b8)",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No activity yet</div>
                <div style={{ fontSize: 12 }}>Activity will appear here as you use the studio.</div>
              </div>
            ) : (
              <div>
                {activities.map((entry) => (
                  <ActivityItem key={entry.id} entry={entry} />
                ))}
              </div>
            )}
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Link
                href="/activity"
                style={{ fontSize: 12, color: "var(--color-primary, #6366f1)", fontWeight: 600, textDecoration: "none" }}
              >
                View all activity →
              </Link>
            </div>
          </Panel>

          {/* Agent Status Panel */}
          <Panel>
            <SectionHeader
              title="Agent Status"
              action={
                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>
                  7 / 7 ready
                </span>
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {AGENTS.map((agent) => (
                <AgentRow key={agent.name} agent={agent} />
              ))}
            </div>
          </Panel>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PROVIDER STATUS ROW                                                */}
        {/* ------------------------------------------------------------------ */}
        <Panel>
          <SectionHeader
            title="AI Providers"
            action={
              <Link
                href="/settings#providers"
                style={{ fontSize: 12, color: "var(--color-primary, #6366f1)", fontWeight: 600, textDecoration: "none" }}
              >
                Configure →
              </Link>
            }
          />
          {providersLoading ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} width={80} height={26} radius={999} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {providers.map((p) => (
                <ProviderPill key={p.name} name={p.name} configured={p.configured} />
              ))}
              {providers.length === 0 && (
                <span style={{ fontSize: 13, color: "var(--color-text-muted, #94a3b8)" }}>
                  No providers configured yet.{" "}
                  <Link href="/settings#providers" style={{ color: "var(--color-primary, #6366f1)", fontWeight: 600 }}>
                    Add one →
                  </Link>
                </span>
              )}
            </div>
          )}
        </Panel>

        {/* ------------------------------------------------------------------ */}
        {/* ANu COMPANION WIDGET                                               */}
        {/* ------------------------------------------------------------------ */}
        <AnuWidget />
      </div>
    </>
  );
}
