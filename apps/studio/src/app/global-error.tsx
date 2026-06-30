"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body style={{
                margin: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100dvh",
                fontFamily: "system-ui, sans-serif",
                background: "#0d0f14",
                color: "#f1f3f9",
                gap: "16px",
                padding: "24px",
                boxSizing: "border-box",
            }}>
                <div style={{ fontSize: "48px", lineHeight: 1 }}>💥</div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                    Critical error
                </h2>
                <p style={{
                    margin: 0,
                    fontSize: "13.5px",
                    color: "#8b92a8",
                    textAlign: "center",
                    maxWidth: "400px",
                }}>
                    {error.message || "A critical error occurred. Please reload the page."}
                </p>
                <button
                    onClick={reset}
                    style={{
                        padding: "8px 20px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#3b66ff",
                        color: "#fff",
                        fontSize: "13.5px",
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                >
                    Reload
                </button>
            </body>
        </html>
    );
}
