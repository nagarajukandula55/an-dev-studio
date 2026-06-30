/**
 * ============================================================================
 * Logger — Unit tests
 * ============================================================================
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Logger, ScopedLogger } from "../Logger";
import { LogLevel }             from "../LogLevel";

describe("Logger", () => {

    beforeEach(() => {
        // Full reset between tests so state doesn't bleed
        Logger.reset();
        Logger.initialize(LogLevel.DEBUG);
    });

    it("logs a debug message and finds it in recent()", () => {
        Logger.debug("TestCtx", "debug message");
        const entries = Logger.recent(10);
        expect(entries.some(e => e.message === "debug message")).toBe(true);
    });

    it("filters entries below minimum log level", () => {
        Logger.reset();
        Logger.initialize(LogLevel.WARN);

        Logger.debug("TestCtx", "should be filtered");
        Logger.info("TestCtx",  "also filtered");
        Logger.warn("TestCtx",  "should pass");

        const entries = Logger.recent(20);
        expect(entries.some(e => e.message === "should be filtered")).toBe(false);
        expect(entries.some(e => e.message === "also filtered")).toBe(false);
        expect(entries.some(e => e.message === "should pass")).toBe(true);
    });

    it("stores log entries with correct fields", () => {
        Logger.info("TestCtx", "hello world", { key: "value" });
        const entries = Logger.recent(5);
        const entry   = entries.find(e => e.message === "hello world");
        expect(entry).toBeDefined();
        expect(entry!.context).toBe("TestCtx");
        expect(entry!.level).toBe(LogLevel.INFO);
        expect(entry!.data).toEqual({ key: "value" });
    });

    it("recent() returns entries in chronological order", () => {
        Logger.info("ctx", "first");
        Logger.info("ctx", "second");
        Logger.info("ctx", "third");

        const entries  = Logger.recent(10);
        const messages = entries.map(e => e.message);
        const firstIdx  = messages.indexOf("first");
        const secondIdx = messages.indexOf("second");
        const thirdIdx  = messages.indexOf("third");

        expect(firstIdx).toBeLessThan(secondIdx);
        expect(secondIdx).toBeLessThan(thirdIdx);
    });

    it("recent() respects count limit", () => {
        for (let i = 0; i < 20; i++) Logger.info("ctx", `msg-${i}`);
        const entries = Logger.recent(5);
        expect(entries.length).toBeLessThanOrEqual(5);
    });

    it("assigns monotonically increasing sequence numbers", () => {
        Logger.info("ctx", "seqA");
        Logger.info("ctx", "seqB");
        const entries = Logger.recent(10);
        const a = entries.find(e => e.message === "seqA")!;
        const b = entries.find(e => e.message === "seqB")!;
        expect(a).toBeDefined();
        expect(b).toBeDefined();
        expect(a.sequence).toBeLessThan(b.sequence);
    });

    it("reset() clears the buffer and allows re-initialization", () => {
        Logger.info("ctx", "before reset");
        Logger.reset();
        const entries = Logger.recent(10);
        expect(entries.length).toBe(0);
    });

    it("filterByLevel returns only matching or higher entries", () => {
        Logger.debug("ctx", "debug-entry");
        Logger.info("ctx",  "info-entry");
        Logger.warn("ctx",  "warn-entry");
        Logger.error("ctx", "error-entry");

        const warns = Logger.filterByLevel(LogLevel.WARN);
        expect(warns.some(e => e.message === "debug-entry")).toBe(false);
        expect(warns.some(e => e.message === "info-entry")).toBe(false);
        expect(warns.some(e => e.message === "warn-entry")).toBe(true);
        expect(warns.some(e => e.message === "error-entry")).toBe(true);
    });

    it("filterByContext returns only entries for that context", () => {
        Logger.info("CtxA", "msg-a");
        Logger.info("CtxB", "msg-b");
        Logger.info("CtxA", "msg-a2");

        const ctxA = Logger.filterByContext("CtxA");
        expect(ctxA.every(e => e.context === "CtxA")).toBe(true);
        expect(ctxA).toHaveLength(2);
    });
});

describe("ScopedLogger", () => {

    beforeEach(() => {
        Logger.reset();
        Logger.initialize(LogLevel.DEBUG);
    });

    it("creates scoped logger via Logger.forContext()", () => {
        const logger = Logger.forContext("ScopedTest");
        expect(logger).toBeInstanceOf(ScopedLogger);
    });

    it("logs with the bound context", () => {
        const logger = Logger.forContext("MyScope");
        logger.info("scoped message");
        const entries = Logger.recent(10);
        const found   = entries.find(e => e.message === "scoped message");
        expect(found).toBeDefined();
        expect(found!.context).toBe("MyScope");
    });

    it("supports debug, info, warn levels", () => {
        const logger = Logger.forContext("LevelTest");
        logger.debug("d");
        logger.info("i");
        logger.warn("w");
        const entries = Logger.recent(20);
        expect(entries.some(e => e.message === "d")).toBe(true);
        expect(entries.some(e => e.message === "i")).toBe(true);
        expect(entries.some(e => e.message === "w")).toBe(true);
    });
});
