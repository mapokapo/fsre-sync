type LogLevel = "debug" | "error" | "info" | "warn";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  error: 50,
  info: 20,
  warn: 40,
};

const configuredLevel: LogLevel =
  process.env["LOG_LEVEL"] === "debug" ||
  process.env["LOG_LEVEL"] === "info" ||
  process.env["LOG_LEVEL"] === "warn" ||
  process.env["LOG_LEVEL"] === "error"
    ? process.env["LOG_LEVEL"]
    : "info";

function formatContext(context: unknown): string {
  if (context === undefined) {
    return "";
  }

  if (context instanceof Error) {
    return ` ${context.stack ?? context.message}`;
  }

  if (typeof context === "object" && context !== null) {
    try {
      return ` ${JSON.stringify(context)}`;
    } catch {
      return " [unserializable context]";
    }
  }

  if (
    typeof context === "string" ||
    typeof context === "number" ||
    typeof context === "boolean" ||
    typeof context === "bigint" ||
    typeof context === "symbol"
  ) {
    return ` ${String(context)}`;
  }

  return "";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[configuredLevel];
}

function write(level: LogLevel, message: string, context?: unknown): void {
  if (!shouldLog(level)) {
    return;
  }

  const line = `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}${formatContext(context)}`;

  switch (level) {
    case "debug":
      // eslint-disable-next-line no-console -- logger is the single allowed console sink
      console.debug(line);
      break;
    case "error":
      console.error(line);
      break;
    case "info":
      // eslint-disable-next-line no-console -- logger is the single allowed console sink
      console.info(line);
      break;
    case "warn":
      console.warn(line);
      break;
  }
}

export const logger = {
  debug(message: string, context?: unknown): void {
    write("debug", message, context);
  },
  error(message: string, context?: unknown): void {
    write("error", message, context);
  },
  info(message: string, context?: unknown): void {
    write("info", message, context);
  },
  warn(message: string, context?: unknown): void {
    write("warn", message, context);
  },
};
