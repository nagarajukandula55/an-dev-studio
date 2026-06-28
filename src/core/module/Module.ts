/**
 * ============================================================================
 * AN Dev Studio
 * Module Contract
 * ----------------------------------------------------------------------------
 * Every feature inside AN Dev Studio is represented as a Module.
 *
 * Examples:
 * - Dashboard
 * - Projects
 * - Git
 * - AI
 * - Users
 * - Settings
 *
 * Modules are discovered and managed by the Module Registry.
 * ============================================================================
 */

export type ModuleCategory =
  | "core"
  | "workspace"
  | "development"
  | "ai"
  | "integration"
  | "system"
  | "plugin";

export interface ModuleRoute {
  path: string;
  title: string;
}

export interface ModuleCommand {
  id: string;
  title: string;
  description?: string;
}

export interface ModulePermission {
  id: string;
  description?: string;
}

export interface StudioModuleMetadata {
  author?: string;
  website?: string;
  repository?: string;
}

export interface StudioModule {
  /**
   * Globally unique module identifier.
   * Example: dashboard
   */
  readonly id: string;

  /**
   * Display name.
   */
  readonly name: string;

  /**
   * Module description.
   */
  readonly description: string;

  /**
   * Semantic version.
   */
  readonly version: string;

  /**
   * Module category.
   */
  readonly category: ModuleCategory;

  /**
   * Icon identifier.
   */
  readonly icon: string;

  /**
   * Routes contributed by this module.
   */
  readonly routes: readonly ModuleRoute[];

  /**
   * Commands exposed by this module.
   */
  readonly commands: readonly ModuleCommand[];

  /**
   * Permissions required by this module.
   */
  readonly permissions: readonly ModulePermission[];

  /**
   * Optional metadata.
   */
  readonly metadata?: StudioModuleMetadata;

  /**
   * Called when the module is loaded.
   */
  initialize(): Promise<void>;

  /**
   * Called before unloading.
   */
  dispose?(): Promise<void>;
}