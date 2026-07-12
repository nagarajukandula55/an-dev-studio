// ============================================================================
// AN Dev Studio — /api/licensing
//
// GET    — current plan + license status (never triggers a blocking network call)
// POST   { licenseKey } — activate a new license key against Lemon Squeezy
// DELETE — deactivate/clear the stored license key
// ============================================================================

import { licenseManager } from "@/lib/licensing/LicenseManager";
import { getPlanLimits } from "@/lib/licensing/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
    const status = licenseManager.getStatus();
    return Response.json({ status, plan: getPlanLimits(status.plan) });
}

export async function POST(req: Request): Promise<Response> {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { licenseKey } = (body ?? {}) as { licenseKey?: unknown };
    if (typeof licenseKey !== "string" || !licenseKey.trim()) {
        return Response.json({ error: "licenseKey is required" }, { status: 400 });
    }

    const result = await licenseManager.activate(licenseKey);
    if (!result.ok) {
        return Response.json({ error: result.error ?? "Activation failed" }, { status: 400 });
    }

    const status = licenseManager.getStatus();
    return Response.json({ status, plan: getPlanLimits(status.plan) });
}

export async function DELETE(): Promise<Response> {
    await licenseManager.deactivate();
    const status = licenseManager.getStatus();
    return Response.json({ status, plan: getPlanLimits(status.plan) });
}
