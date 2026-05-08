type LogLevel = "debug" | "info" | "warn" | "error";

const levelRank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  constructor(private readonly level: LogLevel = "info") {}

  debug(message: string, meta?: unknown): void {
    this.write("debug", message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.write("info", message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.write("warn", message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.write("error", message, meta);
  }

  private write(level: LogLevel, message: string, meta?: unknown): void {
    if (levelRank[level] < levelRank[this.level]) {
      return;
    }

    const suffix = meta === undefined ? "" : ` ${JSON.stringify(meta)}`;
    console.log(`[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${suffix}`);
  }
}

export const logger = new Logger((process.env.CW_LOG_LEVEL as LogLevel | undefined) ?? "info");

