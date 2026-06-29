/**
 * ============================================================================
 * AN Dev Studio
 * Command History
 * ============================================================================
 */

export interface CommandHistoryEntry {

    id: string;

    timestamp: Date;

    duration: number;

    success: boolean;

}

export class CommandHistory {

    private static readonly history: CommandHistoryEntry[] = [];

    public static add(
        entry: CommandHistoryEntry
    ): void {

        this.history.push(entry);

    }

    public static getAll(): readonly CommandHistoryEntry[] {

        return Object.freeze(
            [...this.history]
        );

    }

    public static latest(): CommandHistoryEntry | undefined {

        return this.history.at(-1);

    }

    public static count(): number {

        return this.history.length;

    }

    public static clear(): void {

        this.history.length = 0;

    }

}