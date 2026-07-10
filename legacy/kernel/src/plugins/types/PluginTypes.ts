/**
 * ============================================================================
 * AN Dev Studio — Plugin System Types
 * ============================================================================
 *
 * Defines the contract that every plugin must satisfy.
 * Plugins are isolated modules that extend AN Dev Studio via:
 *   - Additional sidebar nav items
 *   - Additional routes (page components)
 *   - Additional commands
 *   - Service registrations
 *   - Event listeners
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Plugin metadata
// ---------------------------------------------------------------------------

export interface PluginManifest {
    /** Unique reverse-domain identifier, e.g. "com.example.my-plugin" */
    readonly id:          string;
    /** Human-readable display name */
    readonly name:        string;
    /** SemVer version string */
    readonly version:     string;
    /** Short description shown in the plugin manager */
    readonly description: string;
    /** Author name or org */
    readonly author:      string;
    /** Minimum Studio version required (SemVer) */
    readonly minVersion?: string;
    /** IDs of other plugins this plugin depends on */
    readonly dependencies?: string[];
}

// ---------------------------------------------------------------------------
// Plugin contribution points
// ---------------------------------------------------------------------------

export interface PluginCommandContribution {
    /** Unique command ID — must be namespaced: "pluginId.commandName" */
    readonly id:          string;
    readonly label:       string;
    readonly description: string;
    readonly handler:     () => void | Promise<void>;
}

export interface PluginRouteContribution {
    /** URL path, e.g. "/plugins/my-plugin" */
    readonly path:      string;
    /** Display title used in TopBar */
    readonly title:     string;
}

export interface PluginNavItem {
    readonly href:    string;
    readonly label:   string;
    readonly icon?:   string;
}

export interface PluginNavContribution {
    readonly item:    PluginNavItem;
    /** "primary" = top nav group, "bottom" = settings group */
    readonly section: "primary" | "bottom";
}

// ---------------------------------------------------------------------------
// Plugin context — injected by the Studio when activating a plugin
// ---------------------------------------------------------------------------

export interface PluginContext {
    /** Log tagged with the plugin id */
    log(level: "debug" | "info" | "warn" | "error", message: string, data?: unknown): void;
    /** Access Studio configuration under a plugin-namespaced key */
    getConfig<T>(key: string): T | undefined;
    setConfig<T>(key: string, value: T): void;
}

// ---------------------------------------------------------------------------
// Plugin contract — every plugin must export a default satisfying this
// ---------------------------------------------------------------------------

export interface PluginContract {
    /** Metadata declared by the plugin */
    readonly manifest: PluginManifest;

    /**
     * Called once when the plugin is activated.
     * Register commands, nav items, routes etc. here.
     */
    activate(context: PluginContext): void | Promise<void>;

    /**
     * Called when the plugin is deactivated (on uninstall or Studio shutdown).
     * Release any resources acquired during activate().
     */
    deactivate(): void | Promise<void>;

    /** Nav items this plugin contributes (evaluated after activate()) */
    readonly navContributions?: PluginNavContribution[];
    /** Route paths this plugin contributes */
    readonly routeContributions?: PluginRouteContribution[];
    /** Commands this plugin contributes */
    readonly commandContributions?: PluginCommandContribution[];
}

// ---------------------------------------------------------------------------
// Plugin lifecycle state
// ---------------------------------------------------------------------------

export type PluginState =
    | "uninstalled"
    | "installed"
    | "activating"
    | "active"
    | "deactivating"
    | "error";

export interface PluginEntry {
    readonly manifest: PluginManifest;
    readonly plugin:   PluginContract;
    state:             PluginState;
    error?:            string;
    activatedAt?:      number;
}
