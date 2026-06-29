/**
 * ============================================================================
 * AN Dev Studio
 * Runtime Diagnostics
 * ============================================================================
 *
 * Enterprise diagnostics facade.
 *
 * Provides complete runtime health information.
 *
 * ============================================================================
 */

import { Runtime } from "./Runtime";

export class RuntimeDiagnostics {

    /**
     * Complete runtime report.
     */
    public static report() {

        return Runtime.snapshot();

    }

    /**
     * Framework health.
     */
    public static health(): "HEALTHY" | "WARNING" | "CRITICAL" {

        const snapshot = Runtime.snapshot();

        if (snapshot.modules.failed > 0) {
            return "CRITICAL";
        }

        if (snapshot.modules.unhealthy > 0) {
            return "WARNING";
        }

        if (snapshot.events.health !== "HEALTHY") {
            return snapshot.events.health;
        }

        return "HEALTHY";

    }

    /**
     * Pretty print.
     */
    public static print(): void {

        console.log();

        console.log(
            "=================================================="
        );

        console.log(
            "AN DEV STUDIO DIAGNOSTICS"
        );

        console.log(
            "=================================================="
        );

        console.table(
            this.report()
        );

    }

    /**
     * JSON export.
     */
    public static export(): string {

        return JSON.stringify(

            this.report(),

            null,

            4

        );

    }

    /**
     * Verify runtime.
     */
    public static verify(): boolean {

        return this.health() !== "CRITICAL";

    }

}