"use client";

// ============================================================================
// AN Dev Studio — Plans section (client component)
//
// Split out from page.tsx (which stays a server component for metadata +
// JSON-LD) because the currency toggle needs client-side state. Manual
// toggle rather than IP-geolocation on purpose: keeps the page statically
// generated, and is transparent about what price you're looking at rather
// than silently guessing your location.
// ============================================================================

import { useState } from "react";
import Link from "next/link";

type Currency = "usd" | "inr";

interface PlanPricing {
    price: string;
    checkoutHref?: string;
}

interface Plan {
    id: string;
    name: string;
    tagline: string;
    features: string[];
    pricing: Record<Currency, PlanPricing>;
    ctaLabel: string;
    ctaHref?: string; // for non-checkout CTAs (Free/Team) — same for both currencies
    primary: boolean;
}

// India pricing is PPP-adjusted, not a straight USD conversion — see
// docs/business-plan.md for the reasoning. Update checkoutHref for "pro"
// once a separate Lemon Squeezy price/variant exists for INR; until then
// both currencies point at the same checkout link (Lemon Squeezy may show
// localized pricing at checkout regardless of what's displayed here).
const PLANS: Plan[] = [
    {
        id: "free",
        name: "Free",
        tagline: "Try it on your own machine",
        features: ["3 projects", "Local ANu provider only", "Verify-and-fix loop (2 iterations)", "Community support"],
        pricing: { usd: { price: "$0" }, inr: { price: "₹0" } },
        ctaLabel: "Get started",
        ctaHref: "/",
        primary: false,
    },
    {
        id: "pro",
        name: "Pro",
        tagline: "For real projects",
        features: ["Unlimited projects", "Full AI provider fallback chain", "Full verify-and-fix loop with auto-approve", "Priority support"],
        pricing: {
            usd: { price: "$19/mo", checkoutHref: "https://andevstudio.lemonsqueezy.com/checkout/buy/1b82baf9-6d26-4e05-9f9f-23258d7c597e" },
            inr: { price: "₹999/mo", checkoutHref: "https://andevstudio.lemonsqueezy.com/checkout/buy/1b82baf9-6d26-4e05-9f9f-23258d7c597e" },
        },
        ctaLabel: "Upgrade to Pro",
        primary: true,
    },
    {
        id: "team",
        name: "Team",
        tagline: "Shared license seats",
        features: ["Everything in Pro", "Shared team seats", "Coming soon"],
        pricing: { usd: { price: "Coming soon" }, inr: { price: "Coming soon" } },
        ctaLabel: "Notify me",
        ctaHref: "mailto:hello@angroups.dev?subject=AN%20Dev%20Studio%20Team%20plan",
        primary: false,
    },
];

export function PlansSection() {
    const [currency, setCurrency] = useState<Currency>("usd");

    return (
        <section id="plans" style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 96px", scrollMarginTop: 88 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 16 }}>Plans</h2>

            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
                {(["usd", "inr"] as const).map((c) => (
                    <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        style={{
                            padding: "6px 16px",
                            borderRadius: 999,
                            border: currency === c ? "1.5px solid #6366f1" : "1.5px solid #334155",
                            background: currency === c ? "#6366f115" : "transparent",
                            color: currency === c ? "#818cf8" : "#94a3b8",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        {c === "usd" ? "🌐 Global (USD)" : "🇮🇳 India (INR)"}
                    </button>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
                {PLANS.map((plan) => {
                    const pricing = plan.pricing[currency];
                    const href = pricing.checkoutHref ?? plan.ctaHref ?? "#";
                    return (
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
                            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{pricing.price}</div>
                            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>{plan.tagline}</div>
                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
                                {plan.features.map((f) => (
                                    <li key={f} style={{ fontSize: 13, color: "#cbd5e1", padding: "6px 0", display: "flex", gap: 8 }}>
                                        <span style={{ color: "#22c55e" }}>✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href={href}
                                target={href.startsWith("http") ? "_blank" : undefined}
                                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                                style={{
                                    padding: "10px 18px",
                                    borderRadius: 10,
                                    textAlign: "center",
                                    fontWeight: 700,
                                    fontSize: 13,
                                    textDecoration: "none",
                                    background: plan.primary ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                                    border: plan.primary ? "none" : "1.5px solid #334155",
                                    color: "#fff",
                                }}
                            >
                                {plan.ctaLabel}
                            </a>
                        </div>
                    );
                })}
            </div>

            <p style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 24 }}>
                {currency === "inr" ? "India pricing shown includes GST where applicable. " : ""}
                Checkout is hosted by Lemon Squeezy — AN Dev Studio never handles your card details. See{" "}
                <Link href="/faq" style={{ color: "#818cf8" }}>the FAQ</Link> for more, or{" "}
                <code>docs/pricing-launch.md</code> for the full flow.
            </p>
        </section>
    );
}
