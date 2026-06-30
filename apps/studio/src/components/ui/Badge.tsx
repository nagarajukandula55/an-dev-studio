/**
 * ============================================================================
 * AN Dev Studio — Badge
 * ============================================================================
 */

import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "accent";

interface BadgeProps {
    children:  React.ReactNode;
    variant?:  BadgeVariant;
    dot?:      boolean;
    style?:    React.CSSProperties;
}

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
    default: { background: "var(--color-bg-subtle)", color: "var(--color-text-muted)" },
    success: { background: "#dcfce7", color: "#15803d" },
    warning: { background: "#fef9c3", color: "#a16207" },
    danger:  { background: "#fee2e2", color: "#b91c1c" },
    info:    { background: "#dbeafe", color: "#1d4ed8" },
    accent:  {
        background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
        color:      "var(--color-accent)",
    },
};

export function Badge({ children, variant = "default", dot = false, style }: BadgeProps) {
    return (
        <span style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          "4px",
            padding:      "2px 8px",
            borderRadius: "999px",
            fontSize:     "11.5px",
            fontWeight:   500,
            lineHeight:   "18px",
            whiteSpace:   "nowrap",
            ...BADGE_STYLES[variant],
            ...style,
        }}>
            {dot && (
                <span style={{
                    width:        "6px",
                    height:       "6px",
                    borderRadius: "50%",
                    background:   "currentColor",
                    flexShrink:   0,
                }} />
            )}
            {children}
        </span>
    );
}
