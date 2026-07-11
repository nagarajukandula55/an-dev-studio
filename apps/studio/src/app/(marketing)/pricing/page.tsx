// ============================================================================
// AN Dev Studio — Public pricing / marketing page
//
// Standalone (no AppShell/sidebar — this is meant to be linkable to people
// who haven't installed the app yet). Hero, the privacy pitch, plan
// comparison table, and checkout links. Plan data mirrors
// lib/licensing/plans.ts by hand (this page has no server-side data
// dependency on purpose, so it can be statically generated/exported).
// ============================================================================

import Link from "next/link";

const PLANS = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        tagline: "Try it on your own machine",
        features: [
            "3 projects",
            "Local ANu provider only",
            "Verify-and-fix loop (2 iterations)",
            "Community support",
        ],
        cta: { label: "Get started", href: "/", primary: false },
    },
    {
        id: "pro",
        name: "Pro",
        price: "$19/mo",
        tagline: "For real projects",
        features: [
            "Unlimited projects",
            "Full AI provider fallback chain",
            "Full verify-and-fix loop with auto-approve",
            "Priority support",
        ],
        cta: { label: "Upgrade to Pro", href: "https://an-dev-studio.lemonsqueezy.com/checkout", primary: true },
    },
    {
        id: "team",
        name: "Team",
        price: "Coming soon",
        tagline: "Shared license seats",
        features: ["Everything in Pro", "Shared team seats", "Coming soon"],
        cta: { label: "Notify me", href: "mailto:hello@angroups.dev?subject=AN%20Dev%20Studio%20Team%20plan", primary: false },
    },
];

export default function PricingPage() {
    return (
        <div style={{ minHeight: "100vh", background: "#0b0f19", color: "#e2e8f0" }}>
            {/* Hero */}
            <section style={{ maxWidth: 880, margin: "0 auto", padding: "96px 24px 64px", textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "#818cf8", marginBottom: 16 }}>
                    AN DEV STUDIO — BY AN GROUP
                </div>
                <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
                    A local-first AI app builder that never sees your code.
                </h1>
                <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 32px" }}>
                    Six AI agents plan, scaffold, implement, review, fix, and deploy your project — every file write
                    and shell command gated behind your approval, running in your own environment.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <Link
                        href="/"
                        style={{
                            padding: "12px 24px",
                            borderRadius: 10,
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 14,
                            textDecoration: "none",
                        }}
                    >
                        Open the app →
                    </Link>
                    <a
                        href="https://github.com"
                        style={{
                            padding: "12px 24px",
                            borderRadius: 10,
                            border: "1.5px solid #334155",
                            color: "#e2e8f0",
                            fontWeight: 700,
                            fontSize: 14,
                            textDecoration: "none",
                        }}
                    >
                        View on GitHub
                    </a>
                </div>
            </section>

            {/* Privacy pitch */}
            <section style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 80px" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 20,
                    }}
                >
                    {[
                        { icon: "🔒", title: "Your code never leaves your machine", body: "Run fully offline with the local ANu (Ollama) provider — no cloud dependency required." },
                        { icon: "✅", title: "Nothing runs without your approval", body: "Every file write and shell command is a proposal you review and approve — no agent ever touches disk directly." },
                        { icon: "🐳", title: "Sandboxed execution", body: "Approved commands run inside a Docker container scoped to your project folder, not your whole machine." },
                    ].map((f) => (
                        <div key={f.title} style={{ padding: 24, borderRadius: 14, background: "#111827", border: "1px solid #1f2937" }}>
                            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                            <div style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                            <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>{f.body}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Plan comparison */}
            <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 96px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 40 }}>Plans</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            style={{
                                padding: 28,
                                borderRadius: 16,
                                background: plan.id === "pro" ? "linear-gradient(180deg, #1e1b4b, #111827)" : "#111827",
                                border: plan.id === "pro" ? "1.5px solid #6366f1" : "1px solid #1f2937",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#818cf8", marginBottom: 4 }}>{plan.name}</div>
                            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{plan.price}</div>
                            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>{plan.tagline}</div>
                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
                                {plan.features.map((f) => (
                                    <li key={f} style={{ fontSize: 13, color: "#cbd5e1", padding: "6px 0", display: "flex", gap: 8 }}>
                                        <span style={{ color: "#22c55e" }}>✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href={plan.cta.href}
                                target={plan.cta.href.startsWith("http") ? "_blank" : undefined}
                                rel={plan.cta.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                style={{
                                    padding: "10px 18px",
                                    borderRadius: 10,
                                    textAlign: "center",
                                    fontWeight: 700,
                                    fontSize: 13,
                                    textDecoration: "none",
                                    background: plan.cta.primary ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                                    border: plan.cta.primary ? "none" : "1.5px solid #334155",
                                    color: "#fff",
                                }}
                            >
                                {plan.cta.label}
                            </a>
                        </div>
                    ))}
                </div>
                <p style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 24 }}>
                    Checkout is hosted by Lemon Squeezy — AN Dev Studio never handles your card details. See{" "}
                    <code>docs/pricing-launch.md</code> for the full flow.
                </p>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: "1px solid #1f2937", padding: "32px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px" }}>
                    AN Dev Studio is built by <strong style={{ color: "#94a3b8" }}>AN Group</strong>.
                </p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 12 }}>
                    <Link href="/terms" style={{ color: "#64748b", textDecoration: "none" }}>
                        Terms
                    </Link>
                    <Link href="/privacy" style={{ color: "#64748b", textDecoration: "none" }}>
                        Privacy
                    </Link>
                    <a href="mailto:hello@angroups.dev" style={{ color: "#64748b", textDecoration: "none" }}>
                        Contact
                    </a>
                </div>
            </footer>
        </div>
    );
}
