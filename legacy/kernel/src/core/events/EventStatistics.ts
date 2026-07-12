/**
 * ============================================================================
 * AN Dev Studio
 * Event Statistics
 * ============================================================================
 */

export interface EventStatistic {

    emitted: number;

    handled: number;

    failed: number;

}

export class EventStatistics {

    private static readonly stats =
        new Map<string, EventStatistic>();

    public static emitted(type: string): void {

        const stat = this.get(type);

        stat.emitted++;

    }

    public static handled(type: string): void {

        const stat = this.get(type);

        stat.handled++;

    }

    public static failed(type: string): void {

        const stat = this.get(type);

        stat.failed++;

    }

    public static get(type: string): EventStatistic {

        if (!this.stats.has(type)) {

            this.stats.set(type, {

                emitted: 0,

                handled: 0,

                failed: 0,

            });

        }

        return this.stats.get(type)!;

    }

    public static getAll() {

        return this.stats;

    }

    public static clear(): void {

        this.stats.clear();

    }

}