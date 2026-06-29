/**
 * ============================================================================
 * AN Dev Studio
 * Command Contract
 * ============================================================================
 */

import { CommandCategory } from "./CommandCategory";
import { CommandContext } from "./CommandContext";
import { CommandResult } from "./CommandResult";

export interface StudioCommand<T = unknown> {

    readonly id: string;

    readonly title: string;

    readonly description?: string;

    readonly category: CommandCategory;

    readonly icon?: string;

    readonly shortcut?: string;

    readonly enabled?: boolean;

    readonly visible?: boolean;

    execute(
        context?: CommandContext
    ): Promise<CommandResult<T>>;

}