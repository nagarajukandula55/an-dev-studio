/**
 * ============================================================================
 * AN Dev Studio — Button
 * ============================================================================
 */

import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:  ButtonVariant;
    size?:     ButtonSize;
    loading?:  boolean;
    icon?:     React.ReactNode;
    iconRight?: React.ReactNode;
    children?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
        background:  "var(--color-accent)",
        color:       "#fff",
        border:      "1px solid transparent",
    },
    secondary: {
        background:  "var(--color-bg-subtle)",
        color:       "var(--color-text)",
        border:      "1px solid var(--color-border)",
    },
    ghost: {
        background:  "transparent",
        color:       "var(--color-text-muted)",
        border:      "1px solid transparent",
    },
    danger: {
        background:  "#ef4444",
        color:       "#fff",
        border:      "1px solid transparent",
    },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: "5px 10px", fontSize: "12.5px", borderRadius: "6px", gap: "5px" },
    md: { padding: "7px 14px", fontSize: "13.5px", borderRadius: "8px", gap: "6px" },
    lg: { padding: "10px 20px", fontSize: "14px",  borderRadius: "9px", gap: "8px" },
};

export function Button({
    variant  = "secondary",
    size     = "md",
    loading  = false,
    icon,
    iconRight,
    children,
    disabled,
    style,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <button
            disabled={isDisabled}
            style={{
                display:       "inline-flex",
                alignItems:    "center",
                justifyContent: "center",
                fontWeight:    500,
                cursor:        isDisabled ? "not-allowed" : "pointer",
                opacity:       isDisabled ? 0.55 : 1,
                transition:    "background var(--transition-fast), opacity var(--transition-fast), box-shadow var(--transition-fast)",
                outline:       "none",
                whiteSpace:    "nowrap",
                userSelect:    "none",
                lineHeight:    1,
                ...VARIANT_STYLES[variant],
                ...SIZE_STYLES[size],
                ...style,
            }}
            onMouseEnter={isDisabled ? undefined : e => {
                const btn = e.currentTarget;
                if (variant === "primary") btn.style.background = "var(--color-accent-hover)";
                if (variant === "secondary") btn.style.background = "var(--color-border)";
                if (variant === "ghost") { btn.style.background = "var(--color-bg-subtle)"; btn.style.color = "var(--color-text)"; }
            }}
            onMouseLeave={e => {
                const btn = e.currentTarget;
                btn.style.background = VARIANT_STYLES[variant].background as string;
                if (variant === "ghost") btn.style.color = "var(--color-text-muted)";
            }}
            {...props}
        >
            {loading ? (
                <SpinnerIcon />
            ) : (
                <>
                    {icon && <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>}
                    {children && <span>{children}</span>}
                    {iconRight && <span style={{ display: "flex", flexShrink: 0 }}>{iconRight}</span>}
                </>
            )}
        </button>
    );
}

function SpinnerIcon() {
    return (
        <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ animation: "spin 0.8s linear infinite" }}
        >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
    );
}
