// ============================================================================
// AN Dev Studio — Features page
//
// "How it works" in depth: the six-agent pipeline, the approval queue, the
// verify-and-fix loop, and the platform/provider story. Content written to
// be directly quotable by search engines and AI answer engines (GEO): short,
// factual, self-contained claims rather than marketing fluff.
// ============================================================================

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Features — How AN Dev Studio Works",
    description:
        "How AN Dev Studio works: six AI agents (Planner, Scaffolder, Implementer, Reviewer, Fixer, Deployer) plan " +
        "and build your project, every action is gated behind your approval, and a verify-and-fix loop runs your " +
        "build/tests and auto-corrects failures.",
    alternates: { canonical: "/features" },
};

const AGENTS = [
    { name: "Planner", desc: "Turns your one-line prompt into an ordered, buildable feature/file plan." },
    { name: "Scaffolder", desc: "Lays down the initial project skeleton — framework config, folder structure, dependency manifest — for your chosen platform." },
    { name: "Implementer", desc: "Writes or edits the concrete source files for one feature at a time, always in view of the whole project's file tree." },
    { name: "Reviewer", desc: "Checks every proposed diff for coherence — broken imports, style drift, missing pieces — before it ever reaches you." },
    { name: "Fixer", desc: "Reads a build/test failure's error output and proposes the minimal corrective edit, driving the verify-and-fix loop." },
    { name: "Deployer", desc: "Generates run/deploy config — Dockerfile, CI workflow, hosting config — once the project shape exists." },
];

const STEPS = [
    { step: "1", title: "Describe what to build", body: "Pick a platform (Web, Windows, Android, iOS, macOS) and describe your app in one sentence." },
    { step: "2", title: "Review the plan and proposals", body: "The six agents produce a plan and a set of file/command proposals — nothing is written to disk yet." },
    { step: "3", title: "Approve", body: "Every file write and shell command sits in an approval queue. You review each diff and click Approve." },
    { step: "4", title: "Verify", body: "Click Verify build to run install/build/test in a Docker sandbox. On failure, the Fixer proposes a correction and the loop retries — up to your plan's iteration cap." },
    { step: "5", title: "Deploy", body: "The Deployer proposes run/deploy config once your project is in good shape." },
];

export default function FeaturesPage() {
    return (
        <>
            <section style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px 48px", textAlign: "center" }}>
                <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                    Six AI agents. One approval queue. Your machine.
                </h1>
                <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.6 }}>
                    AN Dev Studio replaces a single do-everything chatbot with six focused agents that share one view
                    of your project, so multi-file output stays coherent — and nothing runs until you say so.
                </p>
            </section>

            <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>The six agents</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                    {AGENTS.map((a) => (
                        <div key={a.name} style={{ padding: 20, borderRadius: 12, background: "#111827", border: "1px solid #1f2937" }}>
                            <div style={{ fontWeight: 700, color: "#818cf8", marginBottom: 6 }}>{a.name}</div>
                            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{a.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 96px" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>How it works, step by step</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {STEPS.map((s) => (
                        <div key={s.step} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    flexShrink: 0,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 800,
                                    fontSize: 13,
                                }}
                            >
                                {s.step}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                                <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>{s.body}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 96px", textAlign: "center" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Ready to try it?</h2>
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
                        href="/pricing#plans"
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
                        See plans
                    </Link>
                </div>
            </section>
        </>
    );
}
