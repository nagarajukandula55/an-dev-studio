// ============================================================================
// AN Dev Studio — BuildVerifier Free-plan gating test
//
// Phase 5 acceptance: with no license key the app behaves as Free — the
// verify loop ignores the auto-approve toggle and stops after proposing
// once, awaiting manual approval, regardless of what the project's stored
// toggle says.
// ============================================================================

import { describe, expect, it, beforeEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import type { ProjectContext } from "../../core/types";

describe("BuildVerifier on the Free plan", () => {
    let ctx: ProjectContext;

    beforeEach(async () => {
        const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "an-dev-studio-verify-free-"));
        fs.writeFileSync(
            path.join(targetFolder, "package.json"),
            JSON.stringify({ name: "free-plan-app", version: "1.0.0", scripts: { test: "node -e \"process.exit(0)\"" } }, null, 2),
        );

        ctx = {
            projectId: `free-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            prompt: "a free-plan project",
            platform: "web",
            targetFolder,
        };

        const { autoApproveStore } = await import("../AutoApproveStore");
        autoApproveStore.set(ctx.projectId, true); // toggle on, but plan doesn't allow it
    });

    it("ignores the auto-approve toggle and stops awaiting manual approval", async () => {
        const { licenseManager } = await import("@/lib/licensing/LicenseManager");
        expect(licenseManager.getStatus().plan).toBe("free");

        const { buildVerifier } = await import("../BuildVerifier");
        const report = await buildVerifier.run(ctx);

        expect(report.awaitingApproval).toBe(true);
        expect(report.iterations.length).toBe(1);
        expect(report.iterations[0].commands.every((c) => c.status === "pending")).toBe(true);
    });
});
