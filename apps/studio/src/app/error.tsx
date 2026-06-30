"use client";

import React from "react";

export default function Error({
    error,
    reset,
}: {
    error:  Error & { digest?: string };
    reset:  () => void;
}) {
    return (
        <div style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            height:         "100dvh",
            gap:            "16px",
            padding:        "24px",
            background:     "var(--color-bg)",
        }}>
            <div style={{
                fontSize:   "48px",
                lineHeight: 1,
            }}>⚠️</div>
            <h2 style={{
                margin:     0,
                fontSize:   "18px",
                fontWeight: 700,
                color:      "var(--color-text)",
            }}>
                Something went wrong
            </h2>
            <p style={{
                margin:    0,
                fontSize:  "13.5px",
                color:     "var(--color-text-muted)",
                textAlign: "center",
                maxWidth:  "400px",
            }}>
                {error.message ?? "An unexpected error occurred."}
            </p>
            <button
                onClick={reset}
                style={{
                    padding:      "8px 20px",
                    borderRadius: "8px",
                    border:       "none",
                    background:   "var(--color-accent)",
                    color:        "#fff",
                    fontSize:     "13.5px",
                    fontWeight:   500,
                    cursor:       "pointer",
                }}
            >
                Try again
            </button>
        </div>
    );
}
