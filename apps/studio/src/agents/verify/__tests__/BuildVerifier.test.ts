// ============================================================================
// AN Dev Studio — BuildVerifier integration test (LLM layer mocked)
//
// Phase 3 acceptance: a deliberately broken generated project (missing
// require) is detected, fixed by the loop, and ends green — demonstrated
// here with the LLM layer mocked so the test doesn't depend on a configured
// model provider. Docker isn't available in this test environment, so the
// ApprovalQueue's host-spawn fallback path is what actually executes `npm
// test` — same code path real users hit when they don't have Docker
// installed.
// ============================================================================

import { describe, expect, it, vi, beforeEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import type { ProjectContext } from "../../core/types";

const completeJsonMock = vi.fn();

vi.mock("../../core/llm", () => ({
    complete: vi.fn(),
    completeJson: (...args: unknown[]) => completeJsonMock(...args),
}));

describe("BuildVerifier", () => {
    let targetFolder: string;
    let ctx: ProjectContext;

    beforeEach(async () => {
        targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "an-dev-studio-verify-"));
        fs.writeFileSync(
            path.join(targetFolder, "package.json"),
            JSON.stringify({ name: "broken-app", version: "1.0.0", scripts: { test: "node test.js" } }, null, 2),
        );
        // Deliberately broken: requires a module that doesn't exist.
        fs.writeFileSync(path.join(targetFolder, "index.js"), 'module.exports = require("./does-not-exist");\n');
        fs.writeFileSync(
            path.join(targetFolder, "test.js"),
            'try { require("./index.js"); } catch (e) { console.error(e.message); process.exit(1); }\n' +
                'console.log("ok"); process.exit(0);\n',
        );

        ctx = {
            projectId: `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            prompt: "a tiny broken node project",
            platform: "web",
            targetFolder,
        };

        completeJsonMock.mockReset();
        // FixerAgent's one completeJson call: propose a corrected index.js that
        // doesn't require the missing module.
        completeJsonMock.mockResolvedValueOnce({
            diagnosis: "index.js requires a module that doesn't exist (./does-not-exist).",
            files: [
                {
                    relativePath: "index.js",
                    content: "module.exports = { hello: () => \"hi\" };\n",
                    reason: "Remove the require of a nonexistent module.",
                },
            ],
        });

        const { autoApproveStore } = await import("../AutoApproveStore");
        autoApproveStore.set(ctx.projectId, true);

        // Auto-approve is a Pro-only feature (see lib/licensing/plans.ts) —
        // activate a mocked Pro license so this test actually exercises the
        // unattended loop rather than pausing for manual approval.
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ activated: true, instance: { id: "test-instance" } }),
        }) as unknown as typeof fetch;
        const { licenseManager } = await import("@/lib/licensing/LicenseManager");
        await licenseManager.activate("TEST-PRO-KEY");
    });

    it("detects a broken build, fixes it via FixerAgent, and ends green", async () => {
        const { buildVerifier } = await import("../BuildVerifier");
        const report = await buildVerifier.run(ctx);

        expect(report.success).toBe(true);
        expect(report.capped).toBe(false);
        expect(report.iterations.length).toBe(2);

        // First iteration: npm test failed.
        expect(report.iterations[0].commands.some((c) => c.status === "failed")).toBe(true);
        expect(report.iterations[0].fixRequestIds?.length).toBeGreaterThan(0);

        // Second iteration: npm test passed after the fix was applied.
        expect(report.iterations[1].commands.every((c) => c.status === "applied")).toBe(true);

        const fixedContent = fs.readFileSync(path.join(targetFolder, "index.js"), "utf-8");
        expect(fixedContent).toContain("hello");
        expect(completeJsonMock).toHaveBeenCalledTimes(1);
    }, 30000);
});
