/**
 * ============================================================================
 * AN Dev Studio
 * Boot Report
 * ============================================================================
 */

export interface BootReport {

    framework: string;

    version: string;

    startedAt: Date;

    completedAt?: Date;

    bootTime?: number;

    state: string;

    modulesLoaded: number;

    servicesLoaded: number;

    healthyModules: number;

    failedModules: number;

    warnings: string[];

    success: boolean;

}