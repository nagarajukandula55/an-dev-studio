/**
 * ============================================================================
 * AN Dev Studio
 * Event History
 * ============================================================================
 */

import { TypedEvent } from "./EventPipeline";

export class EventHistory {

    private static readonly history: TypedEvent<any>[] = [];

    private static readonly MAX_HISTORY = 10000;

    public static push(event: TypedEvent<any>): void {

        this.history.push(event);

        if (this.history.length > this.MAX_HISTORY) {
            this.history.shift();
        }

    }

    public static getAll(): readonly TypedEvent<any>[] {
        return Object.freeze([...this.history]);
    }

    public static latest(count = 10): readonly TypedEvent<any>[] {
        return Object.freeze(
            this.history.slice(-count)
        );
    }

    public static clear(): void {
        this.history.length = 0;
    }

    public static count(): number {
        return this.history.length;
    }

}