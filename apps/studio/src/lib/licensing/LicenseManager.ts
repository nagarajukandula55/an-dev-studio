// ============================================================================
// AN Dev Studio — License Manager
//
// Desktop-first monetization: license keys, not hosted accounts. Stores the
// key + last validation result in SQLite (lib/db/settingsRepo.ts), validates
// against Lemon Squeezy's license-key API, and never bricks the app when
// offline: a successful validation is cached for a 7-day grace window, and
// only re-checked against the network at most once per 24h.
//
// Config (env — see .env.example): LEMONSQUEEZY_API_BASE (defaults to the
// real API), LEMONSQUEEZY_PRODUCT_ID / LEMONSQUEEZY_STORE_ID (identify which
// product this app's Pro plan corresponds to; not required for activate/
// validate calls themselves, which are keyed by the license key the user
// pastes in, but kept here so a future checkout-link builder or Paddle swap
// has one place to look). Swapping to Paddle later means implementing this
// same activate/revalidate/getStatus contract against Paddle's API instead.
// ============================================================================

import type { PlanId } from "./plans";
import { getSetting, setSetting } from "@/lib/db/settingsRepo";

const REVALIDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // re-check the network at most once per day
const OFFLINE_GRACE_MS = 7 * 24 * 60 * 60 * 1000; // never brick the app because wifi is down

const SETTINGS_KEY = "license_state";

export const LEMONSQUEEZY_CONFIG = {
    apiBase: process.env.LEMONSQUEEZY_API_BASE?.trim() || "https://api.lemonsqueezy.com/v1",
    storeId: process.env.LEMONSQUEEZY_STORE_ID?.trim() || "",
    proProductId: process.env.LEMONSQUEEZY_PRODUCT_ID?.trim() || "",
};

interface LicenseState {
    licenseKey: string | null;
    instanceId: string | null;
    plan: PlanId;
    lastValidatedAt: number | null;
}

const DEFAULT_STATE: LicenseState = { licenseKey: null, instanceId: null, plan: "free", lastValidatedAt: null };

export interface LicenseStatus {
    plan: PlanId;
    licenseKeyMasked: string | null;
    lastValidatedAt: number | null;
    /** True once the 24h re-check interval has passed but we're still inside the 7-day offline grace window. */
    graceActive: boolean;
    graceExpiresAt: number | null;
}

function readState(): LicenseState {
    const raw = getSetting(SETTINGS_KEY);
    if (!raw) return DEFAULT_STATE;
    try {
        return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_STATE;
    }
}

function writeState(state: LicenseState): void {
    setSetting(SETTINGS_KEY, JSON.stringify(state));
}

function mask(key: string): string {
    return key.length <= 4 ? "••••" : `••••${key.slice(-4)}`;
}

interface LemonSqueezyLicenseResponse {
    activated?: boolean;
    valid?: boolean;
    error?: string | null;
    instance?: { id: string; name: string } | null;
}

async function callLemonSqueezy(path: "activate" | "validate" | "deactivate", body: Record<string, string>): Promise<LemonSqueezyLicenseResponse> {
    const res = await fetch(`${LEMONSQUEEZY_CONFIG.apiBase}/licenses/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
    });
    const data = (await res.json()) as LemonSqueezyLicenseResponse;
    if (!res.ok && !data.error) {
        throw new Error(`Lemon Squeezy ${path} request failed with status ${res.status}`);
    }
    return data;
}

class LicenseManagerImpl {
    /** Synchronous — safe to call on every gated request. May trigger a fire-and-forget background revalidation. */
    getStatus(): LicenseStatus {
        const state = readState();

        if (!state.licenseKey || state.plan !== "pro") {
            return { plan: "free", licenseKeyMasked: null, lastValidatedAt: null, graceActive: false, graceExpiresAt: null };
        }

        const now = Date.now();
        const lastValidatedAt = state.lastValidatedAt ?? 0;
        const age = now - lastValidatedAt;
        const graceExpiresAt = lastValidatedAt + OFFLINE_GRACE_MS;
        const withinGrace = now < graceExpiresAt;

        if (age > REVALIDATE_INTERVAL_MS) {
            // Best-effort, non-blocking — this call's answer still uses the cached plan below.
            void this.revalidate();
        }

        if (!withinGrace) {
            // Grace period expired without a successful revalidation — demote to Free
            // until the next successful check (network back, or the user re-activates).
            return { plan: "free", licenseKeyMasked: mask(state.licenseKey), lastValidatedAt: state.lastValidatedAt, graceActive: false, graceExpiresAt };
        }

        return {
            plan: "pro",
            licenseKeyMasked: mask(state.licenseKey),
            lastValidatedAt: state.lastValidatedAt,
            graceActive: age > REVALIDATE_INTERVAL_MS,
            graceExpiresAt,
        };
    }

    /** Activates a new license key. Only overwrites stored state on a genuinely successful activation. */
    async activate(licenseKey: string): Promise<{ ok: boolean; error?: string }> {
        const trimmed = licenseKey.trim();
        if (!trimmed) return { ok: false, error: "License key is required." };

        try {
            const result = await callLemonSqueezy("activate", { license_key: trimmed, instance_name: "an-dev-studio-desktop" });
            if (!result.activated) {
                return { ok: false, error: result.error ?? "License key could not be activated." };
            }
            writeState({ licenseKey: trimmed, instanceId: result.instance?.id ?? null, plan: "pro", lastValidatedAt: Date.now() });
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : "Activation request failed." };
        }
    }

    /** Re-checks the current key against the network. Never throws — a failure just leaves the cached state as-is (grace period handles the rest). */
    async revalidate(): Promise<void> {
        const state = readState();
        if (!state.licenseKey) return;

        try {
            const result = await callLemonSqueezy("validate", { license_key: state.licenseKey, instance_id: state.instanceId ?? "" });
            if (result.valid) {
                writeState({ ...state, plan: "pro", lastValidatedAt: Date.now() });
            }
            // An explicit "invalid" response (not a network error) means the key was
            // revoked/refunded — demote immediately rather than waiting out the grace period.
            else if (result.valid === false) {
                writeState({ ...state, plan: "free" });
            }
        } catch {
            // Network error — leave state untouched; getStatus()'s grace-period logic covers this.
        }
    }

    async deactivate(): Promise<void> {
        const state = readState();
        if (state.licenseKey) {
            try {
                await callLemonSqueezy("deactivate", { license_key: state.licenseKey, instance_id: state.instanceId ?? "" });
            } catch {
                // Best-effort — clear local state regardless so the user can re-enter a key.
            }
        }
        writeState(DEFAULT_STATE);
    }
}

export const licenseManager = new LicenseManagerImpl();
