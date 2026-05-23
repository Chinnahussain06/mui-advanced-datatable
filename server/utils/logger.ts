import pino from "pino";

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || "debug",
  transport: process.env.NODE_ENV !== "production" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname"
    }
  } : undefined
});

export class Logger {
  static info(message: string, context = "SYSTEM") {
    pinoLogger.info({ context }, message);
  }

  static warn(message: string, context = "SYSTEM", error?: any) {
    pinoLogger.warn({ context, error: error ? { message: error.message, stack: error.stack } : undefined }, message);
  }

  static error(message: string, context = "SYSTEM", error?: any) {
    pinoLogger.error({ context, error: error ? { message: error.message, stack: error.stack } : undefined }, message);
  }

  static debug(message: string, context = "SYSTEM") {
    pinoLogger.debug({ context }, message);
  }
}
