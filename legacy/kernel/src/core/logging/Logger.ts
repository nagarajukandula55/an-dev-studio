import { LogLevel } from "./LogLevel";

type LogEntry = {
    sequence: number;
    level: LogLevel;
    context: string;
    message: string;
    data?: unknown;
    timestamp: Date;
};

export class Logger {
    private static currentLevel = LogLevel.INFO;
    private static readonly entries: LogEntry[] = [];
    private static sequence = 0;

    public static initialize(level: LogLevel = LogLevel.INFO): void {
        this.currentLevel = level;
    }

    public static reset(): void {
        this.entries.length = 0;
        this.sequence = 0;
        this.currentLevel = LogLevel.INFO;
    }

    public static clear(): void {
        this.reset();
    }

    public static forContext(context: string): ScopedLogger {
        return new ScopedLogger(context);
    }

    public static debug(context: string, message: string, data?: unknown): void {
        this.write(LogLevel.DEBUG, context, message, data);
    }

    public static info(context: string, message: string, data?: unknown): void {
        this.write(LogLevel.INFO, context, message, data);
    }

    public static warn(context: string, message: string, data?: unknown): void {
        this.write(LogLevel.WARN, context, message, data);
    }

    public static error(context: string, message: string, data?: unknown): void {
        this.write(LogLevel.ERROR, context, message, data);
    }

    public static recent(count = 50): readonly LogEntry[] {
        return Object.freeze(this.entries.slice(-count));
    }

    public static getEntries(): readonly LogEntry[] {
        return this.recent(this.entries.length);
    }

    public static filterByLevel(level: LogLevel): readonly LogEntry[] {
        return Object.freeze(this.entries.filter(entry => entry.level >= level));
    }

    public static filterByContext(context: string): readonly LogEntry[] {
        return Object.freeze(this.entries.filter(entry => entry.context === context));
    }

    private static write(
        level: LogLevel,
        context: string,
        message: string,
        data?: unknown,
    ): void {
        if (level < this.currentLevel) return;

        const entry: LogEntry = {
            sequence: ++this.sequence,
            level,
            context,
            message,
            data,
            timestamp: new Date(),
        };

        this.entries.push(entry);

        const prefix = `[${LogLevel[level]}] [${context}]`;
        if (level >= LogLevel.ERROR) {
            console.error(prefix, message, data ?? "");
        } else if (level >= LogLevel.WARN) {
            console.warn(prefix, message, data ?? "");
        } else {
            console.log(prefix, message, data ?? "");
        }
    }
}

export class ScopedLogger {
    public constructor(private readonly context: string) {}

    public debug(message: string, data?: unknown): void {
        Logger.debug(this.context, message, data);
    }

    public info(message: string, data?: unknown): void {
        Logger.info(this.context, message, data);
    }

    public warn(message: string, data?: unknown): void {
        Logger.warn(this.context, message, data);
    }

    public error(message: string, data?: unknown): void {
        Logger.error(this.context, message, data);
    }
}
