/**
 * ============================================================================
 * ServiceContainer — Unit tests
 * ============================================================================
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ServiceContainer } from "../ServiceContainer";

// Use unique symbols per test file to avoid collision with real service tokens
const TOKEN_A        = Symbol("test.container.a");
const TOKEN_B        = Symbol("test.container.b");
const TOKEN_C        = Symbol("test.container.c");
const TOKEN_TRANSIENT = Symbol("test.container.transient");

describe("ServiceContainer", () => {

    beforeEach(() => {
        ServiceContainer.unregister(TOKEN_A);
        ServiceContainer.unregister(TOKEN_B);
        ServiceContainer.unregister(TOKEN_C);
        ServiceContainer.unregister(TOKEN_TRANSIENT);
    });

    it("registers and resolves a singleton value", async () => {
        const svc = { name: "svc-a" };
        ServiceContainer.register(TOKEN_A, () => svc, "singleton");
        const resolved = await ServiceContainer.resolve<{ name: string }>(TOKEN_A);
        expect(resolved).toBe(svc);
    });

    it("returns the same singleton instance on repeated resolves", async () => {
        let calls = 0;
        ServiceContainer.register(TOKEN_B, () => {
            calls++;
            return { id: calls };
        }, "singleton");

        const a = await ServiceContainer.resolve<{ id: number }>(TOKEN_B);
        const b = await ServiceContainer.resolve<{ id: number }>(TOKEN_B);
        expect(a).toBe(b);
        expect(calls).toBe(1);
    });

    it("returns a new instance each call for transient scope", async () => {
        let calls = 0;
        ServiceContainer.register(TOKEN_TRANSIENT, () => {
            calls++;
            return { id: calls };
        }, "transient");

        const a = await ServiceContainer.resolve<{ id: number }>(TOKEN_TRANSIENT);
        const b = await ServiceContainer.resolve<{ id: number }>(TOKEN_TRANSIENT);
        expect(a).not.toBe(b);
        expect(calls).toBe(2);
    });

    it("throws when resolving an unregistered token", async () => {
        const unknown = Symbol("test.unregistered");
        await expect(
            ServiceContainer.resolve(unknown)
        ).rejects.toThrow();
    });

    it("has() reports registration status correctly", () => {
        ServiceContainer.register(TOKEN_C, () => ({}), "singleton");
        expect(ServiceContainer.has(TOKEN_C)).toBe(true);
        expect(ServiceContainer.has(Symbol("never"))).toBe(false);
    });

    it("unregister() removes the descriptor", () => {
        ServiceContainer.register(TOKEN_A, () => ({ name: "x" }), "singleton");
        expect(ServiceContainer.has(TOKEN_A)).toBe(true);
        ServiceContainer.unregister(TOKEN_A);
        expect(ServiceContainer.has(TOKEN_A)).toBe(false);
    });

    it("replace() overwrites an existing registration", async () => {
        ServiceContainer.register(TOKEN_A, () => ({ v: 1 }), "singleton");
        ServiceContainer.replace(TOKEN_A, () => ({ v: 2 }), "singleton");
        const resolved = await ServiceContainer.resolve<{ v: number }>(TOKEN_A);
        expect(resolved.v).toBe(2);
    });
});
