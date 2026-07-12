// ============================================================================
// AN Dev Studio — LicenseManager tests (Lemon Squeezy fetch mocked)
//
// Phase 5 acceptance: with no key the app behaves as Free; a mocked valid
// key unlocks Pro; the gates (ProviderManager, BuildVerifier, /api/projects)
// read the plan from here rather than the UI enforcing it client-side.
// ============================================================================

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getPlanLimits } from "../plans";

describe("LicenseManager", () => {
    const originalFetch = global.fetch;

    // The license state lives in one fixed settings row (there's only ever one
    // license per install), so tests share it within this file — reset to a
    // clean Free slate before each test rather than relying on execution order.
    beforeEach(async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch;
        const { licenseManager } = await import("../LicenseManager");
        await licenseManager.deactivate();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    it("defaults to the Free plan with no license key", async () => {
        const { licenseManager } = await import("../LicenseManager");
        const status = licenseManager.getStatus();
        expect(status.plan).toBe("free");
        expect(status.licenseKeyMasked).toBeNull();
        expect(getPlanLimits(status.plan).maxProjects).toBe(3);
    });

    it("activating a valid key unlocks Pro", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ activated: true, instance: { id: "inst-1", name: "an-dev-studio-desktop" } }),
        }) as unknown as typeof fetch;

        const { licenseManager } = await import("../LicenseManager");
        const result = await licenseManager.activate("VALID-KEY-1234");
        expect(result.ok).toBe(true);

        const status = licenseManager.getStatus();
        expect(status.plan).toBe("pro");
        expect(status.licenseKeyMasked).toBe("••••1234");
        expect(getPlanLimits(status.plan).maxProjects).toBeNull();
        expect(getPlanLimits(status.plan).autoApproveAllowed).toBe(true);
    });

    it("rejects an invalid key without changing plan", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ activated: false, error: "This license key is not valid." }),
        }) as unknown as typeof fetch;

        const { licenseManager } = await import("../LicenseManager");
        const result = await licenseManager.activate("BAD-KEY");
        expect(result.ok).toBe(false);
        expect(result.error).toContain("not valid");
        expect(licenseManager.getStatus().plan).toBe("free");
    });

    it("deactivate clears the key and returns to Free", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ activated: true, instance: { id: "inst-2", name: "x" } }),
        }) as unknown as typeof fetch;

        const { licenseManager } = await import("../LicenseManager");
        await licenseManager.activate("SOME-KEY-5678");
        expect(licenseManager.getStatus().plan).toBe("pro");

        await licenseManager.deactivate();
        const status = licenseManager.getStatus();
        expect(status.plan).toBe("free");
        expect(status.licenseKeyMasked).toBeNull();
    });
});
