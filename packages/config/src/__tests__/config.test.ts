/**
 * ============================================================================
 * @an-groups/config — Unit tests
 * ============================================================================
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
    getEnvironment,
    isDevelopment,
    isProduction,
    isTest,
    env,
    envNumber,
    envBool,
    deepMerge,
} from "../index";

describe("getEnvironment", () => {
    it("returns 'test' in the test environment", () => {
        // Vitest sets NODE_ENV=test
        expect(getEnvironment()).toBe("test");
        expect(isTest()).toBe(true);
        expect(isDevelopment()).toBe(false);
        expect(isProduction()).toBe(false);
    });
});

describe("env()", () => {
    const KEY = "__AN_TEST_VAR__";

    beforeEach(() => {
        delete process.env[KEY];
    });

    afterEach(() => {
        delete process.env[KEY];
    });

    it("returns undefined when variable is unset and no fallback", () => {
        expect(env(KEY)).toBeUndefined();
    });

    it("returns the fallback when variable is unset", () => {
        expect(env(KEY, "default")).toBe("default");
    });

    it("returns the variable value when set", () => {
        process.env[KEY] = "hello";
        expect(env(KEY, "default")).toBe("hello");
    });
});

describe("envNumber()", () => {
    const KEY = "__AN_TEST_NUM__";

    afterEach(() => { delete process.env[KEY]; });

    it("returns fallback when unset", () => {
        expect(envNumber(KEY, 42)).toBe(42);
    });

    it("parses valid number string", () => {
        process.env[KEY] = "123";
        expect(envNumber(KEY, 0)).toBe(123);
    });

    it("returns fallback for non-numeric value", () => {
        process.env[KEY] = "nope";
        expect(envNumber(KEY, 99)).toBe(99);
    });
});

describe("envBool()", () => {
    const KEY = "__AN_TEST_BOOL__";

    afterEach(() => { delete process.env[KEY]; });

    it("returns fallback when unset", () => {
        expect(envBool(KEY)).toBe(false);
        expect(envBool(KEY, true)).toBe(true);
    });

    it.each([["1"], ["true"], ["yes"], ["on"], ["TRUE"], ["YES"]])(
        "returns true for truthy value '%s'",
        (val) => {
            process.env[KEY] = val;
            expect(envBool(KEY)).toBe(true);
        },
    );

    it("returns false for '0'", () => {
        process.env[KEY] = "0";
        expect(envBool(KEY)).toBe(false);
    });
});

describe("deepMerge()", () => {
    it("merges flat objects", () => {
        const result = deepMerge(
            { a: "base", b: "base" },
            { b: "override" },
        );
        expect(result).toEqual({ a: "base", b: "override" });
    });

    it("deeply merges nested objects", () => {
        const result = deepMerge(
            { outer: { inner: "base", other: "keep" } },
            { outer: { inner: "new" } },
        );
        expect(result.outer.inner).toBe("new");
        expect(result.outer.other).toBe("keep");
    });

    it("does not mutate the base object", () => {
        const base = { a: "base" };
        deepMerge(base, { a: "override" });
        expect(base.a).toBe("base");
    });
});
