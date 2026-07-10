import { StudioKernel } from "./StudioKernel";
import { KernelState } from "./KernelState";

/**
 * ============================================================================
 * AN Dev Studio
 * Kernel Tests
 * ============================================================================
 */

export class KernelTests {

    public static async run(): Promise<void> {

        console.log("");
        console.log("========================================");
        console.log("KERNEL TEST");
        console.log("========================================");
        console.log("");

        /**
         * ----------------------------------------
         * Boot
         * ----------------------------------------
         */

        const report = await StudioKernel.boot();

        console.log(
            "Boot:",
            report.success ? "PASS" : "FAIL"
        );

        /**
         * ----------------------------------------
         * State
         * ----------------------------------------
         */

        console.log(
            "Running:",
            StudioKernel.isRunning()
                ? "PASS"
                : "FAIL"
        );

        console.log(
            "Kernel State:",
            StudioKernel.getState()
        );

        /**
         * ----------------------------------------
         * Summary
         * ----------------------------------------
         */

        console.log("");
        console.log("Summary");

        console.table(
            StudioKernel.summary()
        );

        /**
         * ----------------------------------------
         * Diagnostics
         * ----------------------------------------
         */

        console.log("");
        console.log("Diagnostics");

        console.dir(
            StudioKernel.diagnostics(),
            { depth: null }
        );

        /**
         * ----------------------------------------
         * Restart
         * ----------------------------------------
         */

        await StudioKernel.restart();

        console.log(
            "Restart: PASS"
        );

        /**
         * ----------------------------------------
         * Shutdown
         * ----------------------------------------
         */

        await StudioKernel.shutdown();

        console.log(
            "Shutdown:",
            StudioKernel.getState() === KernelState.STOPPED
                ? "PASS"
                : "FAIL"
        );

        console.log("");
        console.log("========================================");
        console.log("KERNEL TEST COMPLETE");
        console.log("========================================");
        console.log("");

    }

}