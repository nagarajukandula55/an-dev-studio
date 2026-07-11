// ============================================================================
// AN Dev Studio — Privacy Policy (placeholder)
//
// PLACEHOLDER CONTENT — not reviewed by a lawyer. Replace before real launch.
// The factual claims here (local-first, no telemetry beyond what's listed)
// should stay true to how the app actually works — see docs/audit.md and
// apps/studio/src/agents/README.md for what's actually implemented.
// ============================================================================

export default function PrivacyPage() {
    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", color: "#e2e8f0", background: "#0b0f19", minHeight: "100vh" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
            <p style={{ color: "#f59e0b", fontSize: 13, marginBottom: 32 }}>
                ⚠️ Placeholder — this page has not been reviewed by a lawyer. Replace before real launch. See{" "}
                <code>docs/business-plan.md</code> for the pre-launch legal checklist.
            </p>
            <div style={{ color: "#94a3b8", lineHeight: 1.7, fontSize: 14 }}>
                <p>AN Dev Studio is local-first by design:</p>
                <ul>
                    <li>Your project code and prompts are processed by whichever AI provider you configure. With the local ANu provider, nothing leaves your machine. With a cloud provider (Groq, Cerebras, etc.), your prompts and code context are sent to that provider per their own privacy policy.</li>
                    <li>Approvals, project metadata, activity log, and license status are stored locally in SQLite on your machine — not on our servers.</li>
                    <li>License key validation calls Lemon Squeezy&apos;s API with your license key — no project code or prompts are sent as part of that call.</li>
                    <li>We do not currently collect product analytics/telemetry. If that changes, this policy will be updated first.</li>
                </ul>
            </div>
        </div>
    );
}
