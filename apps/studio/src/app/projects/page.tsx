"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProjectType =
  | "website"
  | "mobile-app"
  | "api"
  | "desktop-app"
  | "chrome-extension"
  | "cli"
  | "library"
  | "saas"
  | "other";

type ProjectStatus = "planning" | "active" | "paused" | "completed" | "archived";

interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  techStack: string[];
  status: ProjectStatus;
  repoUrl?: string;
  deployUrl?: string;
  createdAt: string;
  updatedAt: string;
  tasksTotal: number;
  tasksCompleted: number;
  color: string;
}

type FilterStatus = "all" | ProjectStatus;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<ProjectType, string> = {
  website: "Website",
  "mobile-app": "Mobile App",
  api: "REST API",
  "desktop-app": "Desktop App",
  "chrome-extension": "Chrome Ext.",
  cli: "CLI Tool",
  library: "Library / SDK",
  saas: "SaaS",
  other: "Other",
};

const TYPE_ICONS: Record<ProjectType, string> = {
  website: "🌐",
  "mobile-app": "📱",
  api: "🔌",
  "desktop-app": "🖥️",
  "chrome-extension": "🧩",
  cli: "⌨️",
  library: "📦",
  saas: "⚡",
  other: "🗂️",
};

const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  planning: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  active: { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  paused: { bg: "#e0e7ff", text: "#3730a3", dot: "#6366f1" },
  completed: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  archived: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: number;
  accent: string;
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface, #ffffff)",
        border: "1px solid var(--border, #e2e8f0)",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <span
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: accent,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "var(--muted, #64748b)",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProgressBar
// ---------------------------------------------------------------------------

interface ProgressBarProps {
  completed: number;
  total: number;
  color: string;
}

function ProgressBar({ completed, total, color }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--muted, #64748b)",
          fontWeight: 500,
        }}
      >
        <span>Tasks</span>
        <span>{completed}/{total}</span>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 999,
          background: "var(--border, #e2e8f0)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: color,
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProjectCard
// ---------------------------------------------------------------------------

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const statusStyle = STATUS_COLORS[project.status];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface, #ffffff)",
        border: `1px solid ${hovered ? project.color + "66" : "var(--border, #e2e8f0)"}`,
        borderRadius: 16,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: hovered
          ? `0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px ${project.color}22`
          : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle color accent stripe at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: project.color,
          borderRadius: "16px 16px 0 0",
        }}
      />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 4 }}>
        {/* Color circle */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: project.color + "20",
            border: `1.5px solid ${project.color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {TYPE_ICONS[project.type]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: "var(--foreground, #0f172a)",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "calc(100% - 90px)",
              }}
            >
              {project.name}
            </h3>
            {/* Type badge */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 999,
                background: project.color + "18",
                color: project.color,
                border: `1px solid ${project.color}33`,
                whiteSpace: "nowrap",
              }}
            >
              {TYPE_LABELS[project.type]}
            </span>
          </div>
          {/* Status badge */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              marginTop: 4,
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 999,
              background: statusStyle.bg,
              color: statusStyle.text,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: statusStyle.dot,
                flexShrink: 0,
              }}
            />
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--muted, #64748b)",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </p>
      )}

      {/* Tech stack chips */}
      {project.techStack.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {project.techStack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 6,
                background: "var(--background, #f8fafc)",
                color: "var(--muted, #64748b)",
                border: "1px solid var(--border, #e2e8f0)",
              }}
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 5 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 6,
                background: "var(--background, #f8fafc)",
                color: "var(--muted, #64748b)",
                border: "1px solid var(--border, #e2e8f0)",
              }}
            >
              +{project.techStack.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <ProgressBar
        completed={project.tasksCompleted}
        total={project.tasksTotal}
        color={project.color}
      />

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--muted, #64748b)",
          }}
        >
          Updated {formatDate(project.updatedAt)}
        </span>
        <Link
          href={`/projects/${project.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontWeight: 600,
            padding: "6px 14px",
            borderRadius: 8,
            background: project.color,
            color: "#ffffff",
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Open
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        gap: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "linear-gradient(135deg, #6366f120, #8b5cf620)",
          border: "1.5px dashed #6366f155",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
        }}
      >
        {hasFilter ? "🔍" : "🗂️"}
      </div>
      <div>
        <h3
          style={{
            margin: "0 0 6px",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--foreground, #0f172a)",
          }}
        >
          {hasFilter ? "No projects match your filter" : "No projects yet"}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "var(--muted, #64748b)",
          }}
        >
          {hasFilter
            ? "Try clearing filters or adjusting your search."
            : "Start building something great. Create your first project now."}
        </p>
      </div>
      {!hasFilter && (
        <Link
          href="/projects/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "10px 22px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#ffffff",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            marginTop: 4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create your first project
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilterBar
// ---------------------------------------------------------------------------

const FILTER_TABS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Planning", value: "planning" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Completed", value: "completed" },
];

interface FilterBarProps {
  active: FilterStatus;
  onChange: (v: FilterStatus) => void;
  counts: Record<FilterStatus, number>;
}

function FilterBar({ active, onChange, counts }: FilterBarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
      }}
    >
      {FILTER_TABS.map(({ label, value }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: isActive
                ? "1.5px solid #6366f1"
                : "1.5px solid var(--border, #e2e8f0)",
              background: isActive
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "var(--surface, #ffffff)",
              color: isActive ? "#ffffff" : "var(--muted, #64748b)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {label}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 999,
                background: isActive ? "rgba(255,255,255,0.25)" : "var(--background, #f1f5f9)",
                color: isActive ? "#ffffff" : "var(--muted, #64748b)",
              }}
            >
              {counts[value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProjectsPage
// ---------------------------------------------------------------------------

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { projects: Project[]; total: number };
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const counts = useMemo<Record<FilterStatus, number>>(() => {
    const c: Record<FilterStatus, number> = {
      all: projects.length,
      planning: 0,
      active: 0,
      paused: 0,
      completed: 0,
      archived: 0,
    };
    for (const p of projects) {
      if (p.status in c) c[p.status as FilterStatus]++;
    }
    return c;
  }, [projects]);

  const filtered = useMemo(() => {
    let list = projects;
    if (filter !== "all") {
      list = list.filter((p) => p.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, filter, search]);

  const totalCount = projects.length;
  const activeCount = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  const hasFilter = filter !== "all" || search.trim() !== "";

  return (
    <AppShell title="Projects">
      {/* Stat row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <StatCard label="Total Projects" value={totalCount} accent="#6366f1" />
        <StatCard label="Active" value={activeCount} accent="#10b981" />
        <StatCard label="Completed" value={completedCount} accent="#3b82f6" />
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        {/* Left: filter + search */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            minWidth: 0,
          }}
        >
          <FilterBar active={filter} onChange={setFilter} counts={counts} />
          <div style={{ position: "relative", maxWidth: 340 }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted, #94a3b8)",
                pointerEvents: "none",
                display: "flex",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: 36,
                paddingLeft: 32,
                paddingRight: 12,
                borderRadius: 8,
                border: "1.5px solid var(--border, #e2e8f0)",
                background: "var(--surface, #ffffff)",
                color: "var(--foreground, #0f172a)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Right: New Project button */}
        <Link
          href="/projects/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "9px 18px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#ffffff",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
            whiteSpace: "nowrap",
            flexShrink: 0,
            alignSelf: "flex-start",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
            gap: 12,
            color: "var(--muted, #64748b)",
            fontSize: 14,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{
              animation: "spin 1s linear infinite",
            }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Loading projects...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 40 }}>⚠️</span>
          <p style={{ fontSize: 14, color: "#ef4444", margin: 0 }}>{error}</p>
          <button
            onClick={() => void fetchProjects()}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1.5px solid #6366f1",
              background: "transparent",
              color: "#6366f1",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasFilter={hasFilter} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
