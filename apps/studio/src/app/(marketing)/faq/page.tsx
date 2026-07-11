// ============================================================================
// AN Dev Studio — FAQ
//
// FAQPage structured data (JSON-LD) makes this eligible for Google's FAQ
// rich results and gives AI answer engines (ChatGPT/Perplexity/Google AI
// Overviews) clean, self-contained Q&A pairs to cite accurately — the core
// technique behind "GEO" (generative engine optimization): answer the exact
// question a user would type, in one direct paragraph, with no fluff.
// ============================================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "FAQ",
    description: "Frequently asked questions about AN Dev Studio — pricing, privacy, how the agents work, and licensing.",
    alternates: { canonical: "/faq" },
};

const FAQS = [
    {
        q: "What is AN Dev Studio?",
        a: "AN Dev Studio is a local-first AI app builder by AN Group. Six AI agents — Planner, Scaffolder, Implementer, Reviewer, Fixer, and Deployer — plan, build, review, fix, and deploy a real software project from a one-line prompt. It runs on your own machine, not a shared cloud service.",
    },
    {
        q: "Does my code leave my machine?",
        a: "Not if you use the local ANu provider (built on Ollama) — everything runs offline. If you choose a cloud AI provider instead (Groq, Cerebras, Mistral, Cloudflare, OpenRouter, Gemini, or HuggingFace), your prompts and code context are sent to that provider per its own privacy policy. You choose which provider to use in Settings.",
    },
    {
        q: "Can the AI agents run commands or write files without my permission?",
        a: "No. Every file write and shell command is proposed as a pending approval — nothing touches disk or executes until you review it and click Approve. This is enforced in one place (the ApprovalQueue) that every agent action must pass through.",
    },
    {
        q: "Is it safe to approve a shell command?",
        a: "Approved shell commands run inside a Docker container scoped to your project folder, not your whole machine, when Docker is available. If Docker isn't installed, commands fall back to running directly on your machine — install Docker for the strongest isolation.",
    },
    {
        q: "How much does AN Dev Studio cost?",
        a: "Free: 3 projects, the local ANu provider only, a 2-iteration verify-and-fix loop, community support. Pro: $19/month (₹999/month in India) for unlimited projects, the full AI provider fallback chain, a 5-iteration verify-and-fix loop with auto-approve, and priority support.",
    },
    {
        q: "How does licensing/billing work?",
        a: "Pro is unlocked with a license key purchased through a one-time Lemon Squeezy hosted checkout — there's no in-app card handling and no hosted account system. You paste the license key into Settings, and the app validates it periodically, with a 7-day offline grace period so it never bricks if you lose network access.",
    },
    {
        q: "Can I use one Pro license on multiple computers?",
        a: "Each license is intended for a single-machine activation, tracked via a unique per-machine identifier. Lemon Squeezy's activation limit enforces this centrally.",
    },
    {
        q: "What platforms can I build for?",
        a: "Web (always available, just needs Node.js), Windows desktop (via Tauri, needs Rust), Android (needs the Android SDK/adb), and iOS/macOS (source files can be proposed, but building requires Xcode on a Mac).",
    },
    {
        q: "What happens if a build fails?",
        a: "Click Verify build to run install/build/test commands. On failure, the Fixer agent reads the error output and proposes a corrective file edit; the loop retries automatically (if auto-approve is on) up to your plan's iteration cap, or waits for your manual approval at each step.",
    },
    {
        q: "Who makes AN Dev Studio?",
        a: "AN Dev Studio is built and published by AN Group.",
    },
];

const STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
};

export default function FaqPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />

            <section style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px 96px" }}>
                <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 40, textAlign: "center" }}>
                    Frequently asked questions
                </h1>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {FAQS.map((f) => (
                        <div key={f.q} style={{ padding: 20, borderRadius: 12, background: "#111827", border: "1px solid #1f2937" }}>
                            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>{f.q}</div>
                            <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>{f.a}</div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
