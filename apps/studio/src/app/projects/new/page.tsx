"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProjectType =
  | "website"
  | "saas"
  | "mobile-app"
  | "api"
  | "desktop-app"
  | "chrome-extension"
  | "library"
  | "cli"
  | "ai-ml"
  | "ecommerce";

interface ProjectTypeOption {
  value: ProjectType;
  label: string;
  icon: string;
  description: string;
  gradient: string;
  accentColor: string;
}

interface WizardState {
  type: ProjectType | null;
  name: string;
  description: string;
  techStack: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROJECT_TYPES: ProjectTypeOption[] = [
  {
    value: "website",
    label: "Website / Landing Page",
    icon: "🌐",
    description: "Marketing site, portfolio, or landing page",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
    accentColor: "#06b6d4",
  },
  {
    value: "ecommerce",
    label: "E-commerce Store",
    icon: "🛍️",
    description: "Online store with product catalog and checkout",
    gradient: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
    accentColor: "#f97316",
  },
  {
    value: "mobile-app",
    label: "Mobile App (React Native)",
    icon: "📱",
    description: "Cross-platform iOS and Android application",
    gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    accentColor: "#10b981",
  },
  {
    value: "saas",
    label: "SaaS Application",
    icon: "⚡",
    description: "Subscription-based web application with dashboards",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    accentColor: "#6366f1",
  },
  {
    value: "api",
    label: "REST API / Backend",
    icon: "🔌",
    description: "API service, microservice, or backend system",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    accentColor: "#3b82f6",
  },
  {
    value: "desktop-app",
    label: "Desktop App (Electron)",
    icon: "🖥️",
    description: "Cross-platform desktop application",
    gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)",
    accentColor: "#64748b",
  },
  {
    value: "chrome-extension",
    label: "Chrome Extension",
    icon: "🧩",
    description: "Browser extension for Chrome or Edge",
    gradient: "linear-gradient(135deg, #eab308 0%, #facc15 100%)",
    accentColor: "#ca8a04",
  },
  {
    value: "library",
    label: "NPM Library / SDK",
    icon: "📦",
    description: "Reusable package for the npm ecosystem",
    gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
    accentColor: "#ec4899",
  },
  {
    value: "cli",
    label: "CLI Tool",
    icon: "⌨️",
    description: "Command-line interface utility or developer tool",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)",
    accentColor: "#14b8a6",
  },
  {
    value: "ai-ml",
    label: "AI / ML Application",
    icon: "🤖",
    description: "Machine learning model, AI agent, or data pipeline",
    gradient: "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
    accentColor: "#a855f7",
  },
];

const TECH_SUGGESTIONS: Record<ProjectType, string[]> = {
  website: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel", "Astro", "Framer Motion"],
  ecommerce: ["Next.js", "React", "TypeScript", "Stripe", "Shopify", "Prisma", "PostgreSQL"],
  "mobile-app": ["React Native", "Expo", "TypeScript", "NativeWind", "Zustand", "React Query"],
  saas: ["Next.js", "React", "TypeScript", "Prisma", "PostgreSQL", "Stripe", "NextAuth.js", "Vercel"],
  api: ["Node.js", "TypeScript", "Express", "Fastify", "PostgreSQL", "Redis", "Docker", "Prisma"],
  "desktop-app": ["Electron", "React", "TypeScript", "Vite", "SQLite", "Node.js"],
  "chrome-extension": ["TypeScript", "React", "Vite", "Chrome APIs", "Manifest V3"],
  library: ["TypeScript", "Rollup", "Vite", "Jest", "ESLint", "Changesets"],
  cli: ["Node.js", "TypeScript", "Commander.js", "Inquirer.js", "Chalk", "Ora"],
  "ai-ml": ["Python", "TypeScript", "LangChain", "OpenAI", "Ollama", "FastAPI", "PyTorch", "Vercel AI SDK"],
};

const API_TYPE_MAP: Record<ProjectType, string> = {
  website: "website",
  ecommerce: "website",
  "mobile-app": "mobile-app",
  saas: "saas",
  api: "api",
  "desktop-app": "desktop-app",
  "chrome-extension": "chrome-extension",
  library: "library",
  cli: "cli",
  "ai-ml": "other",
};

// ---------------------------------------------------------------------------
// StepIndicator
// ---------------------------------------------------------------------------

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div style={{ marginBottom: 40 }}>
      {/* Step label */}
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--muted, #64748b)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Step {currentStep} of {totalSteps}
      </p>

      {/* Progress track */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          position: "relative",
        }}
      >
        {labels.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <React.Fragment key={label}>
              {/* Step node */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    background: isDone
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : isActive
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "var(--surface, #ffffff)",
                    color: isDone || isActive ? "#ffffff" : "var(--muted, #94a3b8)",
                    border: isDone || isActive
                      ? "none"
                      : "2px solid var(--border, #e2e8f0)",
                    boxShadow: isActive
                      ? "0 0 0 4px rgba(99,102,241,0.2)"
                      : "none",
                    transition: "all 0.25s",
                  }}
                >
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive
                      ? "#6366f1"
                      : isDone
                      ? "var(--foreground, #0f172a)"
                      : "var(--muted, #94a3b8)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {i < labels.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: isDone
                      ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                      : "var(--border, #e2e8f0)",
                    marginBottom: 22,
                    transition: "background 0.25s",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Project Type
// ---------------------------------------------------------------------------

interface Step1Props {
  selected: ProjectType | null;
  onSelect: (t: ProjectType) => void;
  onNext: () => void;
}

function Step1TypeSelect({ selected, onSelect, onNext }: Step1Props) {
  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          margin: "0 0 6px",
          color: "var(--foreground, #0f172a)",
        }}
      >
        What are you building?
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--muted, #64748b)",
          margin: "0 0 24px",
        }}
      >
        Select the type of project to get tailored scaffolding and tech suggestions.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {PROJECT_TYPES.map((pt) => {
          const isSelected = selected === pt.value;
          return (
            <TypeCard
              key={pt.value}
              option={pt}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onNext}
          disabled={!selected}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "11px 24px",
            borderRadius: 10,
            border: "none",
            background: selected
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : "var(--border, #e2e8f0)",
            color: selected ? "#ffffff" : "var(--muted, #94a3b8)",
            cursor: selected ? "pointer" : "not-allowed",
            boxShadow: selected ? "0 4px 14px rgba(99,102,241,0.3)" : "none",
            transition: "all 0.2s",
          }}
        >
          Continue
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TypeCard
// ---------------------------------------------------------------------------

interface TypeCardProps {
  option: ProjectTypeOption;
  isSelected: boolean;
  onSelect: (t: ProjectType) => void;
}

function TypeCard({ option, isSelected, onSelect }: TypeCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(option.value)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        padding: "16px",
        borderRadius: 14,
        border: isSelected
          ? `2px solid ${option.accentColor}`
          : "2px solid var(--border, #e2e8f0)",
        background: isSelected
          ? option.accentColor + "0f"
          : hovered
          ? "var(--surface, #ffffff)"
          : "var(--surface, #ffffff)",
        cursor: "pointer",
        textAlign: "left",
        boxShadow: isSelected
          ? `0 4px 16px ${option.accentColor}30`
          : hovered
          ? "0 4px 12px rgba(0,0,0,0.06)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "all 0.18s",
        transform: hovered && !isSelected ? "translateY(-1px)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient orb background */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: option.gradient,
          opacity: isSelected ? 0.15 : hovered ? 0.08 : 0.05,
          transition: "opacity 0.18s",
          pointerEvents: "none",
        }}
      />

      {/* Icon circle */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: option.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
          boxShadow: `0 4px 12px ${option.accentColor}40`,
        }}
      >
        {option.icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--foreground, #0f172a)",
            marginBottom: 3,
          }}
        >
          {option.label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--muted, #64748b)",
            lineHeight: 1.5,
          }}
        >
          {option.description}
        </div>
      </div>

      {/* Selected checkmark */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: option.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Project Details
// ---------------------------------------------------------------------------

interface Step2Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onBack: () => void;
  onNext: () => void;
}

function Step2Details({ state, onChange, onBack, onNext }: Step2Props) {
  const suggestions = state.type ? TECH_SUGGESTIONS[state.type] ?? [] : [];
  const canContinue = state.name.trim().length > 0;

  const toggleTech = (tech: string) => {
    if (state.techStack.includes(tech)) {
      onChange({ techStack: state.techStack.filter((t) => t !== tech) });
    } else {
      onChange({ techStack: [...state.techStack, tech] });
    }
  };

  const selectedType = PROJECT_TYPES.find((t) => t.value === state.type);

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          margin: "0 0 6px",
          color: "var(--foreground, #0f172a)",
        }}
      >
        Project Details
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--muted, #64748b)",
          margin: "0 0 28px",
        }}
      >
        Tell us a bit about your project.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Selected type reminder */}
        {selectedType && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 10,
              background: selectedType.accentColor + "12",
              border: `1.5px solid ${selectedType.accentColor}30`,
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: 16 }}>{selectedType.icon}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: selectedType.accentColor,
              }}
            >
              {selectedType.label}
            </span>
          </div>
        )}

        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="proj-name"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--foreground, #0f172a)",
            }}
          >
            Project Name
            <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>
          </label>
          <input
            id="proj-name"
            type="text"
            placeholder="e.g. My Awesome SaaS"
            value={state.name}
            onChange={(e) => onChange({ name: e.target.value })}
            style={{
              height: 42,
              padding: "0 14px",
              borderRadius: 10,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: "var(--surface, #ffffff)",
              color: "var(--foreground, #0f172a)",
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.15s",
              boxSizing: "border-box",
              width: "100%",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border, #e2e8f0)")}
          />
        </div>

        {/* Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="proj-desc"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--foreground, #0f172a)",
            }}
          >
            Description
          </label>
          <textarea
            id="proj-desc"
            placeholder="A brief description of what this project does..."
            value={state.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={3}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid var(--border, #e2e8f0)",
              background: "var(--surface, #ffffff)",
              color: "var(--foreground, #0f172a)",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              lineHeight: 1.6,
              transition: "border-color 0.15s",
              boxSizing: "border-box",
              width: "100%",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border, #e2e8f0)")}
          />
        </div>

        {/* Tech stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--foreground, #0f172a)",
            }}
          >
            Tech Stack
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                color: "var(--muted, #64748b)",
                fontWeight: 400,
              }}
            >
              Select all that apply
            </span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {suggestions.map((tech) => {
              const active = state.techStack.includes(tech);
              return (
                <button
                  key={tech}
                  onClick={() => toggleTech(tech)}
                  style={{
                    padding: "6px 13px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    border: active
                      ? "1.5px solid #6366f1"
                      : "1.5px solid var(--border, #e2e8f0)",
                    background: active
                      ? "linear-gradient(135deg, #6366f110, #8b5cf610)"
                      : "var(--surface, #ffffff)",
                    color: active ? "#6366f1" : "var(--muted, #64748b)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {active && (
                    <span style={{ marginRight: 4 }}>✓</span>
                  )}
                  {tech}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 36,
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "11px 20px",
            borderRadius: 10,
            border: "1.5px solid var(--border, #e2e8f0)",
            background: "var(--surface, #ffffff)",
            color: "var(--foreground, #0f172a)",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "11px 24px",
            borderRadius: 10,
            border: "none",
            background: canContinue
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : "var(--border, #e2e8f0)",
            color: canContinue ? "#ffffff" : "var(--muted, #94a3b8)",
            cursor: canContinue ? "pointer" : "not-allowed",
            boxShadow: canContinue ? "0 4px 14px rgba(99,102,241,0.3)" : "none",
            transition: "all 0.2s",
          }}
        >
          Continue
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: AI Setup
// ---------------------------------------------------------------------------

interface Step3Props {
  state: WizardState;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
}

function Step3AiSetup({ state, onBack, onSubmit, submitting, submitError }: Step3Props) {
  const selectedType = PROJECT_TYPES.find((t) => t.value === state.type);

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          margin: "0 0 6px",
          color: "var(--foreground, #0f172a)",
        }}
      >
        AI Setup
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--muted, #64748b)",
          margin: "0 0 28px",
        }}
      >
        Review your project and let ANu scaffold it for you.
      </p>

      {/* ANu card */}
      <div
        style={{
          background: "linear-gradient(135deg, #6366f108, #8b5cf608)",
          border: "1.5px solid #6366f125",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 20,
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          🤖
        </div>
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--foreground, #0f172a)",
            }}
          >
            ANu will scaffold this project for you
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--muted, #64748b)",
              lineHeight: 1.6,
            }}
          >
            Click "Create Project" to proceed. ANu will generate the initial file structure,
            boilerplate, and configuration files based on your selections.
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div
        style={{
          background: "var(--surface, #ffffff)",
          border: "1.5px solid var(--border, #e2e8f0)",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 28,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--muted, #64748b)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Project Summary
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "10px 20px",
            fontSize: 14,
          }}
        >
          <span style={{ color: "var(--muted, #64748b)", fontWeight: 500 }}>Name</span>
          <span style={{ color: "var(--foreground, #0f172a)", fontWeight: 600 }}>
            {state.name || "—"}
          </span>

          <span style={{ color: "var(--muted, #64748b)", fontWeight: 500 }}>Type</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--foreground, #0f172a)",
              fontWeight: 600,
            }}
          >
            {selectedType?.icon} {selectedType?.label ?? "—"}
          </span>

          {state.description && (
            <>
              <span style={{ color: "var(--muted, #64748b)", fontWeight: 500 }}>Description</span>
              <span style={{ color: "var(--foreground, #0f172a)" }}>{state.description}</span>
            </>
          )}

          {state.techStack.length > 0 && (
            <>
              <span style={{ color: "var(--muted, #64748b)", fontWeight: 500 }}>Tech Stack</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {state.techStack.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "var(--background, #f1f5f9)",
                      color: "var(--foreground, #0f172a)",
                      border: "1px solid var(--border, #e2e8f0)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}

          <span style={{ color: "var(--muted, #64748b)", fontWeight: 500 }}>Initial Status</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              padding: "2px 10px",
              borderRadius: 999,
              background: "#fef3c7",
              color: "#92400e",
              width: "fit-content",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#f59e0b",
              }}
            />
            Planning
          </span>
        </div>

        {/* What ANu will create */}
        <div
          style={{
            borderTop: "1px solid var(--border, #e2e8f0)",
            paddingTop: 14,
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--muted, #64748b)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            What will be created
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {[
              "Project record saved to your Studio workspace",
              "Initial task list and milestone planning",
              "Recommended folder structure for " + (selectedType?.label ?? "your project"),
              state.techStack.length > 0
                ? `Configuration files for ${state.techStack.slice(0, 3).join(", ")}${state.techStack.length > 3 ? " and more" : ""}`
                : "Starter configuration files",
              "AI chat context pre-loaded with your project details",
            ].map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--foreground, #0f172a)",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Error */}
      {submitError && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#fef2f2",
            border: "1.5px solid #fecaca",
            color: "#dc2626",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {submitError}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          disabled={submitting}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "11px 20px",
            borderRadius: 10,
            border: "1.5px solid var(--border, #e2e8f0)",
            background: "var(--surface, #ffffff)",
            color: "var(--foreground, #0f172a)",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "11px 24px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#ffffff",
            cursor: submitting ? "not-allowed" : "pointer",
            boxShadow: submitting ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
            opacity: submitting ? 0.75 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {submitting ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Creating...
            </>
          ) : (
            <>
              Create Project
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Done
// ---------------------------------------------------------------------------

interface Step4Props {
  project: { id: string; name: string; type: string; color: string } | null;
}

function Step4Done({ project }: Step4Props) {
  const selectedType = PROJECT_TYPES.find((t) => t.value === (project?.type ?? ""));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "40px 24px",
        gap: 24,
      }}
    >
      {/* Success animation */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(99,102,241,0.45)",
          animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            margin: "0 0 8px",
            color: "var(--foreground, #0f172a)",
            letterSpacing: "-0.02em",
          }}
        >
          Project Created!
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "var(--muted, #64748b)",
            margin: 0,
          }}
        >
          <strong style={{ color: "var(--foreground, #0f172a)" }}>{project?.name}</strong> has been
          created and is ready to build.
        </p>
      </div>

      {/* Project card */}
      {project && (
        <div
          style={{
            background: "var(--surface, #ffffff)",
            border: "1.5px solid var(--border, #e2e8f0)",
            borderRadius: 16,
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            maxWidth: 400,
            width: "100%",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: selectedType?.gradient ?? "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {selectedType?.icon ?? "🗂️"}
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--foreground, #0f172a)",
                marginBottom: 3,
              }}
            >
              {project.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--muted, #64748b)",
              }}
            >
              {selectedType?.label ?? "Project"} · Planning
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a
          href={`/projects/${project?.id ?? ""}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "11px 22px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#ffffff",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View Project
        </a>
        <a
          href="/studio"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "11px 22px",
            borderRadius: 10,
            border: "1.5px solid var(--border, #e2e8f0)",
            background: "var(--surface, #ffffff)",
            color: "var(--foreground, #0f172a)",
            textDecoration: "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          Open in AI Studio
        </a>
        <a
          href="/projects"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            padding: "11px 22px",
            borderRadius: 10,
            border: "1.5px solid var(--border, #e2e8f0)",
            background: "var(--surface, #ffffff)",
            color: "var(--foreground, #0f172a)",
            textDecoration: "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          All Projects
        </a>
      </div>

      <style>
        {`@keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }`}
      </style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NewProjectPage (main wizard)
// ---------------------------------------------------------------------------

const STEP_LABELS = ["Project Type", "Details", "AI Setup", "Done"];

// useSearchParams must live inside a Suspense boundary — wrap the real page
import { Suspense } from "react";

function NewProjectPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdProject, setCreatedProject] = useState<{
    id: string;
    name: string;
    type: string;
    color: string;
  } | null>(null);

  const [wizardState, setWizardState] = useState<WizardState>({
    type: null,
    name: "",
    description: "",
    techStack: [],
  });

  // Pre-select type from ?type= query param (links from Sidebar "Build" section)
  useEffect(() => {
    const typeParam = searchParams?.get("type");
    if (!typeParam) return;
    // Map sidebar shorthand → wizard ProjectType
    const map: Record<string, ProjectType> = {
      website:   "website",
      webapp:    "saas",
      mobile:    "mobile-app",
      desktop:   "desktop-app",
      api:       "api",
      extension: "chrome-extension",
      game:      "saas",          // closest available bucket
      automation:"cli",
      cli:       "cli",
      aiml:      "ai-ml",
      saas:      "saas",
    };
    const resolved = map[typeParam] ?? (PROJECT_TYPES.find(t => t.value === typeParam)?.value ?? null);
    if (resolved) {
      setWizardState(prev => ({ ...prev, type: resolved as ProjectType }));
      // Skip to step 2 since type is pre-selected
      setStep(2);
    }
  }, [searchParams]);

  const updateWizard = useCallback((updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!wizardState.type || !wizardState.name.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wizardState.name.trim(),
          description: wizardState.description.trim() || "No description provided.",
          type: API_TYPE_MAP[wizardState.type],
          techStack: wizardState.techStack,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        ok: boolean;
        project: { id: string; name: string; type: string; color: string };
      };

      setCreatedProject(data.project);
      setStep(4);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }, [wizardState, router]);

  return (
    <AppShell title="New Project">
      <StepIndicator
        currentStep={step}
        totalSteps={3}
        labels={STEP_LABELS.slice(0, 3)}
      />

      {step === 1 && (
        <Step1TypeSelect
          selected={wizardState.type}
          onSelect={(t) => updateWizard({ type: t })}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2Details
          state={wizardState}
          onChange={updateWizard}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3AiSetup
          state={wizardState}
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
        />
      )}

      {step === 4 && <Step4Done project={createdProject} />}
    </AppShell>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<AppShell title="New Project"><div style={{ padding: 40, color: "var(--color-text-muted)" }}>Loading…</div></AppShell>}>
      <NewProjectPageInner />
    </Suspense>
  );
}
