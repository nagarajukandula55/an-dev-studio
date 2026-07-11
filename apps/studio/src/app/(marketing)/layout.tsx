// ============================================================================
// AN Dev Studio — Marketing site shared layout
//
// Shared nav + footer for every public marketing page (pricing, features,
// FAQ, terms, privacy). Kept separate from AppShell (the logged-in product
// UI) on purpose — this is what an anonymous visitor sees before ever
// opening the app.
// ============================================================================

import type { ReactNode } from "react";
import Link from "next/link";

const NAV_LINKS = [
    { href: "/pricing", label: "Overview" },
    { href: "/features", label: "Features" },
    { href: "/pricing#plans", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{ background: "#0b0f19", color: "#e2e8f0", minHeight: "100vh" }}>
            <header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                    background: "rgba(11, 15, 25, 0.85)",
                    backdropFilter: "blur(8px)",
                    borderBottom: "1px solid #1f2937",
                }}
            >
                <div
                    style={{
                        maxWidth: 1100,
                        margin: "0 auto",
                        padding: "16px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Link href="/pricing" style={{ fontWeight: 800, fontSize: 15, color: "#e2e8f0", textDecoration: "none" }}>
                        AN Dev Studio
                    </Link>
                    <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        {NAV_LINKS.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", textDecoration: "none" }}
                            >
                                {l.label}
                            </Link>
                        ))}
                        <Link
                            href="/"
                            style={{
                                padding: "8px 16px",
                                borderRadius: 8,
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 13,
                                textDecoration: "none",
                            }}
                        >
                            Open the app
                        </Link>
                    </nav>
                </div>
            </header>

            <main>{children}</main>

            <footer style={{ borderTop: "1px solid #1f2937", padding: "40px 24px" }}>
                <div
                    style={{
                        maxWidth: 1100,
                        margin: "0 auto",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 24,
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 13,
                        color: "#64748b",
                    }}
                >
                    <div>© {new Date().getFullYear()} AN Group. AN Dev Studio.</div>
                    <div style={{ display: "flex", gap: 20 }}>
                        <Link href="/features" style={{ color: "#64748b", textDecoration: "none" }}>Features</Link>
                        <Link href="/pricing" style={{ color: "#64748b", textDecoration: "none" }}>Pricing</Link>
                        <Link href="/faq" style={{ color: "#64748b", textDecoration: "none" }}>FAQ</Link>
                        <Link href="/terms" style={{ color: "#64748b", textDecoration: "none" }}>Terms</Link>
                        <Link href="/privacy" style={{ color: "#64748b", textDecoration: "none" }}>Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
