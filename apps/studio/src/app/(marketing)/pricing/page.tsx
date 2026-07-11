// ============================================================================
// AN Dev Studio — Public pricing / marketing landing page
//
// The main public entry point for people who haven't installed the app yet:
// hero, the privacy pitch, plan comparison, and checkout links. Wrapped by
// (marketing)/layout.tsx for nav/footer. Plan data mirrors
// lib/licensing/plans.ts by hand (this page has no server-side data
// dependency on purpose, so it can be statically generated/exported).
//
// SEO/GEO: metadata export below + JSON-LD (SoftwareApplication, Offer,
// Organization) gives search engines and AI answer engines structured,
// quotable facts about what this product is and costs — see docs/seo-geo.md.
// ============================================================================

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Pricing — Local-first AI App Builder",
    description:
        "AN Dev Studio: a local-first AI app builder by AN Group. Free plan includes 3 projects and the local ANu " +
        "provider. Pro ($19/mo) unlocks unlimited projects, the full AI provider chain, and the full verify-and-fix " +
        "loop with auto-approve.",
    alternates: { canonical: "/pricing" },
};

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

const STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "SoftwareApplication",
            name: "AN Dev Studio",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Windows, macOS, Linux, Web",
            description:
                "A local-first AI app builder where six AI agents plan, scaffold, implement, review, fix, and " +
                "deploy real software projects from a prompt. Every file write and shell command is gated behind " +
                "human approval.",
            offers: [
                { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
                { "@type": "Offer", name: "Pro", price: "19", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "19", priceCurrency: "USD", unitCode: "MON" } },
            ],
            publisher: { "@type": "Organization", name: "AN Group" },
        },
        {
            "@type": "Organization",
            name: "AN Group",
            url: "https://andevstudio.com",
        },
    ],
};

export default function PricingPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
            />

            {/* Hero */}
            <section style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px 64px", textAlign: "center" }}>
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
                    <Link
                        href="/features"
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
                        See how it works
                    </Link>
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
            <section id="plans" style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 96px", scrollMarginTop: 88 }}>
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
                    <Link href="/faq" style={{ color: "#818cf8" }}>the FAQ</Link> for more, or{" "}
                    <code>docs/pricing-launch.md</code> for the full flow.
                </p>
            </section>
        </>
    );
}
