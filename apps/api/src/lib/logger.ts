import winston from "winston";
import { env } from "../config/env.js";
import { getCorrelationId } from "./async-context.js";

const isProduction = env.NODE_ENV === "production";

interface LogInfo extends winston.Logform.TransformableInfo {
  correlationId?: string;
}

const correlationIdFormat = winston.format((info) => {
  const correlationId = getCorrelationId();

  if (correlationId) {
    info.correlationId = correlationId;
  }

  return info;
});

const developmentFormat = winston.format.combine(
  correlationIdFormat(),
  winston.format.colorize(),
  winston.format.timestamp({
    format: "HH:mm:ss",
  }),
  winston.format.printf((info) => {
    const { level, message, timestamp, correlationId, ...meta } = info as LogInfo;

    const prefix = correlationId ? `[${correlationId.slice(0, 8)}] ` : "";
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";

    return `${timestamp} ${level}: ${prefix}${message}${metaStr}`;
  }),
);

const productionFormat = winston.format.combine(
  correlationIdFormat(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console(),
    ...(isProduction
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
          new winston.transports.File({
            filename: "logs/combined.log",
          }),
        ]
      : []),
  ],
});
