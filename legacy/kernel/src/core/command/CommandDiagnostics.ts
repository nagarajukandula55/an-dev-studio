/**
 * ============================================================================
 * AN Dev Studio
 * Command Diagnostics
 * ============================================================================
 */

import { CommandHistory } from "./CommandHistory";
import { CommandRegistry } from "./CommandRegistry";
import { CommandStatistics } from "./CommandStatistics";

export class CommandDiagnostics {

    public static report() {

        const stats = CommandStatistics.getAll();

        let success = 0;
        let failed = 0;

        for (const value of stats.values()) {

            success += value.succeeded;
            failed += value.failed;

        }

        return {

            registeredCommands:
                CommandRegistry.count(),

            executedCommands:
                CommandHistory.count(),

            successfulCommands:
                success,

            failedCommands:
                failed,

            timestamp: new Date(),

        };

    }

}