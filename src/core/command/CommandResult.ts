/**
 * ============================================================================
 * AN Dev Studio
 * Command Result
 * ============================================================================
 */

export interface CommandResult<T = unknown> {

    success: boolean;

    result?: T;

    message?: string;

    error?: Error;

    duration?: number;

}