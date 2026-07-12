/**
 * ============================================================================
 * AN Dev Studio — Root entry point
 * ============================================================================
 *
 * This file is the programmatic entry point for the AN Dev Studio platform.
 * It bootstraps the kernel, registers all services, and starts the system.
 *
 * For the Next.js web UI, see apps/studio/.
 * ============================================================================
 */

import { StudioKernel } from "./core/kernel/StudioKernel";
import { Logger }       from "./core/logging/Logger";
import { LogLevel }     from "./core/logging/LogLevel";

async function main(): Promise<void> {
    Logger.initialize(LogLevel.INFO);
    const log = Logger.forContext("main");

    try {
        log.info("Starting AN Dev Studio platform…");
        await StudioKernel.boot();
        log.info("AN Dev Studio is running");
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        log.error("Fatal boot error", err);
        process.exit(1);
    }
}

main();
