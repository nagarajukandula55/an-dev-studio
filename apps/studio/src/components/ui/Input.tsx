/**
 * ============================================================================
 * AN Dev Studio — Input
 * ============================================================================
 */

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?:       string;
    error?:       string;
    hint?:        string;
    prefixIcon?:  React.ReactNode;
    suffixIcon?:  React.ReactNode;
    wrapperStyle?: React.CSSProperties;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, error, hint, prefixIcon, suffixIcon, wrapperStyle, style, ...props },
    ref,
) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", ...wrapperStyle }}>
            {label && (
                <label style={{
                    fontSize:   "12.5px",
                    fontWeight: 500,
                    color:      "var(--color-text-muted)",
                }}>
                    {label}
                </label>
            )}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                {prefixIcon && (
                    <span style={{
                        position:   "absolute",
                        left:       "10px",
                        color:      "var(--color-text-muted)",
                        display:    "flex",
                        pointerEvents: "none",
                    }}>
                        {prefixIcon}
                    </span>
                )}
                <input
                    ref={ref}
                    style={{
                        width:        "100%",
                        padding:      `8px ${suffixIcon ? "36px" : "12px"} 8px ${prefixIcon ? "36px" : "12px"}`,
                        background:   "var(--color-bg)",
                        border:       `1px solid ${error ? "#ef4444" : "var(--color-border)"}`,
                        borderRadius: "8px",
                        fontSize:     "13.5px",
                        color:        "var(--color-text)",
                        outline:      "none",
                        transition:   "border-color var(--transition-fast), box-shadow var(--transition-fast)",
                        ...style,
                    }}
                    onFocus={e => {
                        e.currentTarget.style.borderColor = error ? "#ef4444" : "var(--color-accent)";
                        e.currentTarget.style.boxShadow  = `0 0 0 2px ${error ? "rgba(239,68,68,0.15)" : "color-mix(in srgb, var(--color-accent) 15%, transparent)"}`;
                    }}
                    onBlur={e => {
                        e.currentTarget.style.borderColor = error ? "#ef4444" : "var(--color-border)";
                        e.currentTarget.style.boxShadow  = "none";
                    }}
                    {...props}
                />
                {suffixIcon && (
                    <span style={{
                        position:   "absolute",
                        right:      "10px",
                        color:      "var(--color-text-muted)",
                        display:    "flex",
                        pointerEvents: "none",
                    }}>
                        {suffixIcon}
                    </span>
                )}
            </div>
            {(error || hint) && (
                <span style={{
                    fontSize: "12px",
                    color:    error ? "#ef4444" : "var(--color-text-muted)",
                }}>
                    {error ?? hint}
                </span>
            )}
        </div>
    );
});
