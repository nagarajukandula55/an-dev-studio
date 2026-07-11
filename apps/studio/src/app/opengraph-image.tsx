import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#0b0f19",
                    backgroundImage: "linear-gradient(135deg, #0b0f19 0%, #1e1b4b 100%)",
                    color: "#e2e8f0",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, color: "#818cf8", marginBottom: 24 }}>
                    AN DEV STUDIO
                </div>
                <div style={{ fontSize: 56, fontWeight: 800, textAlign: "center", padding: "0 80px", lineHeight: 1.2 }}>
                    A local-first AI app builder
                </div>
                <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 20 }}>
                    that never sees your code.
                </div>
                <div style={{ fontSize: 20, color: "#64748b", marginTop: 40 }}>by AN Group</div>
            </div>
        ),
        { ...size },
    );
}
