// ============================================================================
// AN Dev Studio — Terms of Service (placeholder)
//
// PLACEHOLDER CONTENT — not reviewed by a lawyer. Replace with real terms
// (drafted or reviewed by counsel) before taking real payments. Kept here so
// the pricing page has a working link and the shape of what's needed is
// visible, not as legally binding text.
// ============================================================================

export default function TermsPage() {
    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", color: "#e2e8f0", background: "#0b0f19", minHeight: "100vh" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Terms of Service</h1>
            <p style={{ color: "#f59e0b", fontSize: 13, marginBottom: 32 }}>
                ⚠️ Placeholder — this page has not been reviewed by a lawyer. Replace with real terms before accepting
                real payments. See <code>docs/business-plan.md</code> for the pre-launch legal checklist.
            </p>
            <div style={{ color: "#94a3b8", lineHeight: 1.7, fontSize: 14 }}>
                <p>AN Dev Studio is provided by AN Group (&quot;we&quot;, &quot;us&quot;). By using this app you agree to:</p>
                <ul>
                    <li>Use it in accordance with applicable law and the license you&apos;ve activated (Free/Pro/Team).</li>
                    <li>Understand that AI-generated code/config is proposed for your review — you are responsible for what you approve and run.</li>
                    <li>Pro/Team subscriptions are billed via Lemon Squeezy; refunds follow Lemon Squeezy&apos;s standard policy unless stated otherwise.</li>
                </ul>
                <p>Full terms — including liability limits, acceptable use, and termination — to be finalized before launch.</p>
            </div>
        </div>
    );
}
