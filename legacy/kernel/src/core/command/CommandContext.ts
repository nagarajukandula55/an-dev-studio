/**
 * ============================================================================
 * AN Dev Studio
 * Command Context
 * ============================================================================
 */

export interface CommandContext {

    readonly source?: string;

    readonly user?: string;

    readonly workspaceId?: string;

    readonly projectId?: string;

    readonly documentId?: string;

    readonly metadata?: Record<string, unknown>;

}