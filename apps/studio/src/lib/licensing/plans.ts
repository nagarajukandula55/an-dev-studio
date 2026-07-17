// ============================================================================
// AN Dev Studio — Plans
//
// Single source of truth for what each plan allows. Every gate (project
// creation route, ProviderManager's provider chain, BuildVerifier's
// iteration cap) reads from here rather than hard-coding numbers inline.
// ============================================================================

export type PlanId = "free" | "pro" | "team";

export interface PlanLimits {
    id: PlanId;
    label: string;
    /** null = unlimited */
    maxProjects: number | null;
    /**
     * "anu-only" restricts the provider chain to a single provider on Free:
     * on the personal build (ANu shipped) that's specifically the local ANu
     * (Ollama) provider; on the sellable build (ANU_ENABLED=false — see
     * lib/config/buildVariant.ts), ANu doesn't exist, so this instead means
     * "exactly one bring-your-own cloud provider, no automatic fallback
     * chain" — see ProviderManager.streamChat().
     */
    providerAccess: "anu-only" | "full-chain";
    verifyLoopMaxIterations: number;
    autoApproveAllowed: boolean;
    support: string;
}

export const PLANS: Record<PlanId, PlanLimits> = {
    free: {
        id: "free",
        label: "Free",
        maxProjects: 3,
        providerAccess: "anu-only",
        verifyLoopMaxIterations: 2,
        autoApproveAllowed: false,
        support: "Community support",
    },
    pro: {
        id: "pro",
        label: "Pro",
        maxProjects: null,
        providerAccess: "full-chain",
        verifyLoopMaxIterations: 5,
        autoApproveAllowed: true,
        support: "Priority support",
    },
    // Flagged, not built yet — placeholder tier for shared license seats.
    // Same limits as Pro today; exists so plan-comparison UI/copy has
    // somewhere to point without a schema change once Team ships.
    team: {
        id: "team",
        label: "Team",
        maxProjects: null,
        providerAccess: "full-chain",
        verifyLoopMaxIterations: 5,
        autoApproveAllowed: true,
        support: "Priority support + shared seats (coming soon)",
    },
};

export const TEAM_PLAN_FLAGGED = true;

export function getPlanLimits(planId: PlanId): PlanLimits {
    return PLANS[planId];
}
