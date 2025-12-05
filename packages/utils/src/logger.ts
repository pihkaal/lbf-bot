type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  prefix?: string;
  level?: LogLevel;
}

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const satisfies Record<LogLevel, number>;

const COLORS = {
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m", // green
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
} as const;

class Logger {
  private prefix: string;
  private minLevel: number;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || "";
    this.minLevel = LOG_LEVELS[options.level || "info"];
  }

  private formatTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (LOG_LEVELS[level] < this.minLevel) return;

    const timestamp = this.formatTimestamp();
    const color = COLORS[level];
    const levelStr = level.toUpperCase().padEnd(5);
    const prefix = this.prefix ? `[${this.prefix}] ` : "";

    const formattedArgs = args.map((arg) => {
      if (arg instanceof Error) {
        return arg;
      }
      return arg;
    });

    console.log(
      `${COLORS.gray}${timestamp}${COLORS.reset} ${color}${COLORS.bold}${levelStr}${COLORS.reset} ${prefix}${message}`,
      ...formattedArgs,
    );
  }

  debug(message: string, ...args: unknown[]): void {
    this.log("debug", message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log("error", message, ...args);
  }

  fatal(message: string, ...args: unknown[]): never {
    this.log("error", message, ...args);
    process.exit(1);
  }

  child(prefix: string): Logger {
    const childPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix;
    return new Logger({ prefix: childPrefix, level: this.getLevel() });
  }

  private getLevel(): LogLevel {
    const entry = Object.entries(LOG_LEVELS).find(
      ([, value]) => value === this.minLevel,
    );
    return (entry?.[0] as LogLevel) || "info";
  }
}

export const createLogger = (options?: LoggerOptions): Logger => {
  return new Logger(options);
};

export const logger = createLogger();
