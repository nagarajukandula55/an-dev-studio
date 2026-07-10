/**
 * ============================================================================
 * AN Dev Studio
 * Module Contract (Core Interface)
 * ============================================================================
 *
 * Every feature in AN Dev Studio is a Module.
 * This interface defines the contract all modules must follow.
 */

export type StudioModuleCategory =
  | "core"
  | "workspace"
  | "development"
  | "ai"
  | "integration"
  | "system"
  | "AUTO_GENERATED"
  | "plugin";

/**
 * Route exposed by a module.
 */
export interface ModuleRoute {
  path: string;
  title: string;
}

/**
 * Command exposed by a module.
 */
export interface ModuleCommand {
  id: string;
  title: string;
  description?: string;
}

/**
 * Permission required by a module.
 */
export interface ModulePermission {
  id: string;
  description?: string;
}

/**
 * Optional metadata for external integrations.
 */
export interface StudioModuleMetadata {
  author?: string;
  website?: string;
  repository?: string;
}

/**
 * ============================================================================
 * StudioModule
 * ============================================================================
 *
 * Base contract for all modules.
 */
export interface StudioModule {

    readonly id: string;

    readonly name: string;

    readonly description: string;

    readonly version: string;

    readonly category: StudioModuleCategory;

    readonly icon: string;

    readonly routes: readonly ModuleRoute[];

    readonly commands: readonly ModuleCommand[];

    readonly permissions: readonly ModulePermission[];

    readonly metadata?: StudioModuleMetadata;

    readonly tags?: readonly string[];

    readonly enabled?: boolean;

    readonly priority?: number;

    initialize(): Promise<void>;

    dispose?(): Promise<void>;
}