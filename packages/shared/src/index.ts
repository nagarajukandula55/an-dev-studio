/**
 * ============================================================================
 * @an-groups/shared
 * Shared types, utilities and constants for AN Dev Studio
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Result type (Railway-oriented programming)
// ---------------------------------------------------------------------------

export type Ok<T>  = { readonly ok: true;  readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = Error> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T>    { return { ok: true, value }; }
export function err<E>(error: E): Err<E>  { return { ok: false, error }; }

export function isOk<T, E>(r: Result<T, E>): r is Ok<T>   { return r.ok; }
export function isErr<T, E>(r: Result<T, E>): r is Err<E>  { return !r.ok; }

// ---------------------------------------------------------------------------
// Option type
// ---------------------------------------------------------------------------

export type Some<T> = { readonly some: true;  readonly value: T };
export type None    = { readonly some: false };
export type Option<T> = Some<T> | None;

export function some<T>(value: T): Some<T> { return { some: true, value }; }
export const none: None = { some: false };

export function isSome<T>(o: Option<T>): o is Some<T> { return o.some; }
export function isNone<T>(o: Option<T>): o is None     { return !o.some; }

// ---------------------------------------------------------------------------
// Identifier
// ---------------------------------------------------------------------------

/** Branded type for IDs — prevents mixing up string IDs of different entities */
export type Id<Brand extends string> = string & { readonly __brand: Brand };

export function makeId<Brand extends string>(): Id<Brand> {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}` as Id<Brand>;
}

// ---------------------------------------------------------------------------
// Timestamps
// ---------------------------------------------------------------------------

export type ISODateString = string & { readonly __brand: "ISODate" };

export function nowISO(): ISODateString {
    return new Date().toISOString() as ISODateString;
}

// ---------------------------------------------------------------------------
// Common interfaces
// ---------------------------------------------------------------------------

export interface Disposable {
    dispose(): void | Promise<void>;
}

export interface Identifiable {
    readonly id: string;
}

export interface Timestamped {
    readonly createdAt: ISODateString;
    readonly updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Sleeps for the given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Returns a debounced version of fn.
 */
export function debounce<T extends unknown[]>(
    fn:      (...args: T) => void,
    delayMs: number,
): (...args: T) => void {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return (...args: T) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delayMs);
    };
}

/**
 * Groups an array by a key function.
 */
export function groupBy<T>(
    items:  T[],
    keyFn:  (item: T) => string,
): Record<string, T[]> {
    const result: Record<string, T[]> = {};
    for (const item of items) {
        const key = keyFn(item);
        (result[key] ??= []).push(item);
    }
    return result;
}

/**
 * Truncates a string at maxLen, appending ellipsis.
 */
export function truncate(str: string, maxLen: number): string {
    return str.length <= maxLen ? str : `${str.slice(0, maxLen - 1)}…`;
}

/**
 * Strips trailing slashes from a path string.
 */
export function normalizeSlash(path: string): string {
    return path.replace(/\/+$/, "");
}
