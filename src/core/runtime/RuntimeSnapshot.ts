import { KernelState } from "../kernel/KernelState";
import { EventHealthReport } from "../events/EventDiagnostics";

export interface RuntimeSnapshot {

    framework: string;

    version: string;

    kernel: {

        state: KernelState;

        booting: boolean;

    };

    services: {

        registered: number;

    };

    modules: {

        total: number;

        healthy: number;

        unhealthy: number;

        running: number;

        failed: number;

    };

    events: EventHealthReport;

    uptime: {

        startedAt?: Date;

        milliseconds: number;

    };

}