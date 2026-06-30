/**
 * ============================================================================
 * AN Dev Studio — Card
 * ============================================================================
 */

import React from "react";

interface CardProps {
    children:   React.ReactNode;
    className?: string;
    style?:     React.CSSProperties;
    padding?:   string | number;
    onClick?:   () => void;
    hoverable?: boolean;
}

export function Card({
    children,
    style,
    padding = "20px",
    onClick,
    hoverable = false,
}: CardProps) {
    return (
        <div
            onClick={onClick}
            style={{
                background:   "var(--color-bg-surface)",
                border:       "1px solid var(--color-border)",
                borderRadius: "12px",
                padding,
                cursor:       onClick || hoverable ? "pointer" : undefined,
                transition:   "box-shadow var(--transition-fast), border-color var(--transition-fast)",
                ...style,
            }}
            onMouseEnter={hoverable || onClick ? e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-accent)";
                (e.currentTarget as HTMLDivElement).style.boxShadow   = "0 0 0 1px var(--color-accent)";
            } : undefined}
            onMouseLeave={hoverable || onClick ? e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
                (e.currentTarget as HTMLDivElement).style.boxShadow   = "none";
            } : undefined}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title:       string;
    subtitle?:   string;
    action?:     React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
    return (
        <div style={{
            display:      "flex",
            alignItems:   subtitle ? "flex-start" : "center",
            marginBottom: "16px",
            gap:          "12px",
        }}>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: 600,
                    fontSize:   "14px",
                    color:      "var(--color-text)",
                }}>
                    {title}
                </div>
                {subtitle && (
                    <div style={{
                        fontSize:  "12.5px",
                        color:     "var(--color-text-muted)",
                        marginTop: "2px",
                    }}>
                        {subtitle}
                    </div>
                )}
            </div>
            {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
    );
}
