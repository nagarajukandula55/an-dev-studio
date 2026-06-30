/**
 * ============================================================================
 * AN Dev Studio — Plugin Registry
 * ============================================================================
 */

import type { PluginContract, PluginEntry, PluginState } from "../types/PluginTypes";
import { Logger } from "../../core/logging/Logger";

export class PluginRegistry {

    private static instance: PluginRegistry | null = null;

    private readonly log     = Logger.forContext("PluginRegistry");
    private readonly entries = new Map<string, PluginEntry>();

    private constructor() {}

    static getInstance(): PluginRegistry {
        if (!PluginRegistry.instance) {
            PluginRegistry.instance = new PluginRegistry();
        }
        return PluginRegistry.instance;
    }

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    register(plugin: PluginContract): void {
        const { id } = plugin.manifest;
        if (this.entries.has(id)) {
            this.log.warn(`Plugin already registered: ${id} — skipping`);
            return;
        }
        this.entries.set(id, {
            manifest: plugin.manifest,
            plugin,
            state:    "installed",
        });
        this.log.info(`Registered plugin: ${id} v${plugin.manifest.version}`);
    }

    unregister(id: string): void {
        if (!this.entries.has(id)) {
            this.log.warn(`Cannot unregister unknown plugin: ${id}`);
            return;
        }
        this.entries.delete(id);
        this.log.info(`Unregistered plugin: ${id}`);
    }

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    get(id: string): PluginEntry | undefined {
        return this.entries.get(id);
    }

    has(id: string): boolean {
        return this.entries.has(id);
    }

    getAll(): PluginEntry[] {
        return [...this.entries.values()];
    }

    getByState(state: PluginState): PluginEntry[] {
        return this.getAll().filter(e => e.state === state);
    }

    getActive(): PluginEntry[] {
        return this.getByState("active");
    }

    count(): number {
        return this.entries.size;
    }

    // -------------------------------------------------------------------------
    // State mutation (internal, used by PluginLoader)
    // -------------------------------------------------------------------------

    setState(id: string, state: PluginState, error?: string): void {
        const entry = this.entries.get(id);
        if (!entry) {
            throw new Error(`PluginRegistry.setState: unknown plugin ${id}`);
        }
        entry.state = state;
        if (error !== undefined) entry.error = error;
        if (state === "active") entry.activatedAt = Date.now();
    }
}
