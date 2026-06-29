/**
 * ============================================================================
 * AN Dev Studio
 * Command Manager
 * ============================================================================
 *
 * Central execution engine for all commands.
 *
 * Everything (UI, AI, API, plugins) executes through this layer.
 *
 * ============================================================================
 */

import { StudioCommand } from "./Command";
import { CommandContext } from "./CommandContext";
import { CommandResult } from "./CommandResult";
import { CommandRegistry } from "./CommandRegistry";
import { CommandHistory } from "./CommandHistory";
import { CommandStatistics } from "./CommandStatistics";
import { CommandDiagnostics } from "./CommandDiagnostics";

export class CommandManager {

    /**
     * Execute command by ID.
     */
    public static async execute<T = unknown>(
        id: string,
        context?: CommandContext
    ): Promise<CommandResult<T>> {

        const command = CommandRegistry.get<T>(id);

        if (!command) {

            return {
                success: false,
                message: `Command '${id}' not found.`,
            }as CommandResult<T>;

        }

        return this.run(command, context);

    }

    /**
     * Execute command directly.
     */
    public static async run<T = unknown>(
        command: StudioCommand<T>,
        context?: CommandContext
    ): Promise<CommandResult<T>> {

        const start = Date.now();

        try {

            const result = await command.execute(context);

            const duration = Date.now() - start;

            CommandHistory.add({
                id: command.id,
                timestamp: new Date(),
                duration,
                success: result.success,
            });

            CommandStatistics.record(
                command.id,
                result.success
            );

            return {
                ...result,
                duration,
            };

        }
        catch (error) {

            const duration = Date.now() - start;

            CommandHistory.add({
                id: command.id,
                timestamp: new Date(),
                duration,
                success: false,
            });

            CommandStatistics.record(
                command.id,
                false
            );

            return {
                success: false,
                error: error as Error,
                duration,
                message: (error as Error).message,
            };

        }

    }

    /**
     * Execute multiple commands sequentially.
     */
    public static async executeMany(
        ids: string[],
        context?: CommandContext
    ): Promise<CommandResult[]> {

        const results: CommandResult[] = [];

        for (const id of ids) {

            const result = await this.execute(id, context);

            results.push(result);

        }

        return results;

    }

    /**
     * Diagnostics.
     */
    public static diagnostics() {

        return CommandDiagnostics.report();

    }

    /**
     * Reset system (testing only).
     */
    public static reset(): void {

        CommandRegistry.clear();
        CommandHistory.clear();
        CommandStatistics.clear();

    }

}