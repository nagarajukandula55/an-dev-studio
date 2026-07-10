/**
 * ============================================================================
 * AN Dev Studio
 * Command Registry
 * ============================================================================
 *
 * Central runtime registry for all commands.
 *
 * ============================================================================
 */

import { StudioCommand } from "./Command";

export class CommandRegistry {

    /**
     * Commands registry.
     *
     * Different commands may return different result types,
     * so the registry stores them as StudioCommand<any>.
     */
    private static readonly commands =
        new Map<string, StudioCommand<any>>();

    /**
     * Register command.
     */
    public static register<T>(
        command: StudioCommand<T>
    ): void {

        if (this.commands.has(command.id)) {

            throw new Error(
                `Command '${command.id}' is already registered.`
            );

        }

        this.commands.set(
            command.id,
            command
        );

    }

    /**
     * Register multiple commands.
     */
    public static registerMany(
        commands: readonly StudioCommand<any>[]
    ): void {

        for (const command of commands) {

            this.register(command);

        }

    }

    /**
     * Get command.
     */
    public static get<T = unknown>(
        id: string
    ): StudioCommand<T> | undefined {

        return this.commands.get(id) as StudioCommand<T> | undefined;

    }

    /**
     * Exists?
     */
    public static has(
        id: string
    ): boolean {

        return this.commands.has(id);

    }

    /**
     * Remove command.
     */
    public static unregister(
        id: string
    ): boolean {

        return this.commands.delete(id);

    }

    /**
     * All commands.
     */
    public static getAll(): readonly StudioCommand<any>[] {

        return Object.freeze([
            ...this.commands.values()
        ]);

    }

    /**
     * Category filter.
     */
    public static byCategory(
        category: StudioCommand<any>["category"]
    ): readonly StudioCommand<any>[] {

        return this.getAll().filter(
            command => command.category === category
        );

    }

    /**
     * Count.
     */
    public static count(): number {

        return this.commands.size;

    }

    /**
     * Reset.
     */
    public static clear(): void {

        this.commands.clear();

    }

}