/**
 * ============================================================================
 * AN Dev Studio — Plugin Loader
 * ============================================================================
 *
 * Handles the full lifecycle of a plugin:
 *   install → activate → deactivate → uninstall
 * ============================================================================
 */

import type { PluginContract, PluginContext } from "../types/PluginTypes";
import { PluginRegistry }                     from "../registry/PluginRegistry";
import { Logger }                             from "../../core/logging/Logger";

export class PluginLoader {

    private static instance: PluginLoader | null = null;

    private readonly log      = Logger.forContext("PluginLoader");
    private readonly registry = PluginRegistry.getInstance();

    private constructor() {}

    static getInstance(): PluginLoader {
        if (!PluginLoader.instance) {
            PluginLoader.instance = new PluginLoader();
        }
        return PluginLoader.instance;
    }

    // -------------------------------------------------------------------------
    // Install
    // -------------------------------------------------------------------------

    install(plugin: PluginContract): void {
        const { id } = plugin.manifest;
        this.log.info(`Installing plugin: ${id}`);
        this.registry.register(plugin);
    }

    // -------------------------------------------------------------------------
    // Activate
    // -------------------------------------------------------------------------

    async activate(id: string): Promise<void> {
        const entry = this.registry.get(id);
        if (!entry) {
            throw new Error(`Cannot activate unknown plugin: ${id}`);
        }
        if (entry.state === "active") {
            this.log.warn(`Plugin already active: ${id}`);
            return;
        }

        this.log.info(`Activating plugin: ${id}`);
        this.registry.setState(id, "activating");

        const context = this.buildContext(id);
        try {
            await entry.plugin.activate(context);
            this.registry.setState(id, "active");
            this.log.info(`Plugin activated: ${id}`);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.registry.setState(id, "error", msg);
            this.log.error(`Plugin activation failed: ${id}`, { error: msg });
            throw e;
        }
    }

    // -------------------------------------------------------------------------
    // Deactivate
    // -------------------------------------------------------------------------

    async deactivate(id: string): Promise<void> {
        const entry = this.registry.get(id);
        if (!entry) {
            throw new Error(`Cannot deactivate unknown plugin: ${id}`);
        }
        if (entry.state !== "active") {
            this.log.warn(`Plugin not active — nothing to deactivate: ${id}`);
            return;
        }

        this.log.info(`Deactivating plugin: ${id}`);
        this.registry.setState(id, "deactivating");

        try {
            await entry.plugin.deactivate();
            this.registry.setState(id, "installed");
            this.log.info(`Plugin deactivated: ${id}`);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.registry.setState(id, "error", msg);
            this.log.error(`Plugin deactivation failed: ${id}`, { error: msg });
            throw e;
        }
    }

    // -------------------------------------------------------------------------
    // Uninstall
    // -------------------------------------------------------------------------

    async uninstall(id: string): Promise<void> {
        const entry = this.registry.get(id);
        if (!entry) return;

        if (entry.state === "active") {
            await this.deactivate(id);
        }
        this.registry.unregister(id);
        this.log.info(`Uninstalled plugin: ${id}`);
    }

    // -------------------------------------------------------------------------
    // Activate all installed plugins
    // -------------------------------------------------------------------------

    async activateAll(): Promise<void> {
        const installed = this.registry.getByState("installed");
        this.log.info(`Activating ${installed.length} installed plugins`);
        for (const entry of installed) {
            await this.activate(entry.manifest.id);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private buildContext(pluginId: string): PluginContext {
        const scopedLog = Logger.forContext(`Plugin:${pluginId}`);
        const store     = new Map<string, unknown>();

        return {
            log(level, message, data) {
                scopedLog[level](message, data);
            },
            getConfig<T>(key: string): T | undefined {
                return store.get(key) as T | undefined;
            },
            setConfig<T>(key: string, value: T): void {
                store.set(key, value);
            },
        };
    }
}
