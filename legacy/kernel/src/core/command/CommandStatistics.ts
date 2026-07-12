/**
 * ============================================================================
 * AN Dev Studio
 * Command Statistics
 * ============================================================================
 */

export interface CommandStatistic {

    executed: number;

    succeeded: number;

    failed: number;

}

export class CommandStatistics {

    private static readonly stats =
        new Map<string, CommandStatistic>();

    public static record(
        id: string,
        success: boolean
    ): void {

        if (!this.stats.has(id)) {

            this.stats.set(id, {

                executed: 0,

                succeeded: 0,

                failed: 0,

            });

        }

        const stat = this.stats.get(id)!;

        stat.executed++;

        if (success) {

            stat.succeeded++;

        } else {

            stat.failed++;

        }

    }

    public static get(
        id: string
    ): CommandStatistic | undefined {

        return this.stats.get(id);

    }

    public static getAll(): ReadonlyMap<string, CommandStatistic> {

        return this.stats;

    }

    public static clear(): void {

        this.stats.clear();

    }

}