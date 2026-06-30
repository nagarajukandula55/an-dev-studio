/**
 * ============================================================================
 * @an-groups/shared — Unit tests
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import {
    ok, err, isOk, isErr,
    some, none, isSome, isNone,
    makeId,
    sleep,
    debounce,
    groupBy,
    truncate,
    normalizeSlash,
} from "../index";

// ---------------------------------------------------------------------------
// Result<T>
// ---------------------------------------------------------------------------

describe("Result", () => {
    it("ok() creates a success result", () => {
        const r = ok(42);
        expect(r.ok).toBe(true);
        expect(isOk(r)).toBe(true);
        expect(isErr(r)).toBe(false);
        if (isOk(r)) expect(r.value).toBe(42);
    });

    it("err() creates a failure result", () => {
        const e = new Error("boom");
        const r = err(e);
        expect(r.ok).toBe(false);
        expect(isOk(r)).toBe(false);
        expect(isErr(r)).toBe(true);
        if (isErr(r)) expect(r.error).toBe(e);
    });
});

// ---------------------------------------------------------------------------
// Option<T>
// ---------------------------------------------------------------------------

describe("Option", () => {
    it("some() wraps a value", () => {
        const o = some("hello");
        expect(isSome(o)).toBe(true);
        expect(isNone(o)).toBe(false);
        if (isSome(o)) expect(o.value).toBe("hello");
    });

    it("none is empty", () => {
        expect(isSome(none)).toBe(false);
        expect(isNone(none)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// makeId
// ---------------------------------------------------------------------------

describe("makeId", () => {
    it("returns a non-empty string", () => {
        const id = makeId<"test">();
        expect(typeof id).toBe("string");
        expect(id.length).toBeGreaterThan(0);
    });

    it("returns unique values", () => {
        const ids = Array.from({ length: 100 }, () => makeId<"t">());
        const set  = new Set(ids);
        expect(set.size).toBe(100);
    });
});

// ---------------------------------------------------------------------------
// sleep
// ---------------------------------------------------------------------------

describe("sleep", () => {
    it("resolves after the given delay", async () => {
        const start = Date.now();
        await sleep(50);
        expect(Date.now() - start).toBeGreaterThanOrEqual(45);
    });
});

// ---------------------------------------------------------------------------
// debounce
// ---------------------------------------------------------------------------

describe("debounce", () => {
    it("calls the function only once within the delay window", async () => {
        let calls = 0;
        const fn   = debounce(() => { calls++; }, 50);
        fn(); fn(); fn();
        await sleep(80);
        expect(calls).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// groupBy
// ---------------------------------------------------------------------------

describe("groupBy", () => {
    it("groups items by key function", () => {
        const items = [
            { type: "a", value: 1 },
            { type: "b", value: 2 },
            { type: "a", value: 3 },
        ];
        const grouped = groupBy(items, i => i.type);
        expect(grouped["a"]).toHaveLength(2);
        expect(grouped["b"]).toHaveLength(1);
    });

    it("returns empty object for empty array", () => {
        expect(groupBy([], (i: string) => i)).toEqual({});
    });
});

// ---------------------------------------------------------------------------
// truncate
// ---------------------------------------------------------------------------

describe("truncate", () => {
    it("leaves strings shorter than max unchanged", () => {
        expect(truncate("hello", 10)).toBe("hello");
    });

    it("truncates with ellipsis at max length", () => {
        const result = truncate("hello world", 5);
        expect(result.length).toBe(5);
        expect(result.endsWith("…")).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// normalizeSlash
// ---------------------------------------------------------------------------

describe("normalizeSlash", () => {
    it("strips trailing slashes", () => {
        expect(normalizeSlash("/foo/bar/")).toBe("/foo/bar");
        expect(normalizeSlash("/foo/bar///")).toBe("/foo/bar");
    });

    it("leaves paths without trailing slash unchanged", () => {
        expect(normalizeSlash("/foo/bar")).toBe("/foo/bar");
    });
});
