"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// ThemeToggle
// ---------------------------------------------------------------------------

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Placeholder rendered during SSR and before mount — same 36×36 dimensions
  // so layout doesn't shift once the real button mounts.
  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        style={{ width: 36, height: 36, flexShrink: 0 }}
      />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        border: "1px solid var(--border, #e2e8f0)",
        background: "transparent",
        cursor: "pointer",
        color: "var(--foreground, #1a202c)",
        flexShrink: 0,
      }}
    >
      {isDark ? (
        // Sun icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Moon icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// UserAvatar
// ---------------------------------------------------------------------------

function UserAvatar() {
  return (
    <div
      aria-label="User: Nagaraj"
      title="Nagaraj"
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: "0.05em",
        flexShrink: 0,
        userSelect: "none",
        cursor: "default",
      }}
    >
      NA
    </div>
  );
}

// ---------------------------------------------------------------------------
// NotificationBell
// ---------------------------------------------------------------------------

interface NotificationBellProps {
  count?: number;
}

function NotificationBell({ count = 0 }: NotificationBellProps) {
  return (
    <button
      aria-label={
        count > 0 ? `${count} unread notifications` : "No new notifications"
      }
      title={
        count > 0 ? `${count} unread notifications` : "No new notifications"
      }
      style={{
        width: 36,
        height: 36,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        border: "1px solid var(--border, #e2e8f0)",
        background: "transparent",
        cursor: "pointer",
        color: "var(--foreground, #1a202c)",
        flexShrink: 0,
      }}
    >
      {/* Bell icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {/* Badge */}
      {count > 0 && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            minWidth: 16,
            height: 16,
            borderRadius: "50%",
            background: "#ef4444",
            color: "#ffffff",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            padding: "0 3px",
          }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ANuStatusPill
// ---------------------------------------------------------------------------

type AnuStatus = "loading" | "running" | "stopped";

function ANuStatusPill() {
  const [status, setStatus] = useState<AnuStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/anu/status", { method: "GET" })
      .then((res) => {
        if (!cancelled) {
          setStatus(res.ok ? "running" : "stopped");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("stopped");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isRunning = status === "running";
  const dotColor = status === "loading" ? "#f59e0b" : isRunning ? "#22c55e" : "#9ca3af";
  const label =
    status === "loading"
      ? "ANu — checking status"
      : isRunning
      ? "ANu — running"
      : "ANu — not running";

  return (
    <Link
      href="/settings#anu"
      aria-label={label}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        paddingLeft: 8,
        paddingRight: 10,
        height: 28,
        borderRadius: 999,
        border: "1px solid var(--border, #e2e8f0)",
        background: "var(--surface, #f8fafc)",
        textDecoration: "none",
        color: "var(--foreground, #1a202c)",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        flexShrink: 0,
        transition: "background 0.15s",
      }}
    >
      {/* Status dot */}
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
          transition: "background 0.3s",
          boxShadow: isRunning ? `0 0 0 2px ${dotColor}33` : "none",
        }}
      />
      ANu
    </Link>
  );
}

// ---------------------------------------------------------------------------
// TopBar
// ---------------------------------------------------------------------------

export function TopBar() {
  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 16,
        paddingRight: 16,
        borderBottom: "1px solid var(--border, #e2e8f0)",
        background: "var(--background, #ffffff)",
        boxSizing: "border-box",
      }}
    >
      {/* Left: Logo / brand */}
      <Link
        href="/"
        aria-label="Go to home"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          color: "var(--foreground, #1a202c)",
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: "-0.01em",
        }}
      >
        {/* Studio logo mark */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: "#6366f1" }}
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        Studio
      </Link>

      {/* Right: controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ANuStatusPill />
        <UserAvatar />
        <NotificationBell count={3} />
        <ThemeToggle />
      </div>
    </header>
  );
}
