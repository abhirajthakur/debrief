import winston from "winston";
import { env } from "../config/env.js";
import { getCorrelationId } from "./async-context.js";

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp }) => {
    const correlationId = getCorrelationId();
    const prefix = correlationId ? `[${correlationId.slice(0, 8)}] ` : "";
    return `${timestamp} ${level}: ${prefix}${message}`;
  }),
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf((info) => JSON.stringify({ ...info, correlationId: getCorrelationId() })),
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});
