import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";
import { ApiError } from "../utils/api-error.js";
import { sendError } from "../utils/api-response.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    sendError(res, 400, "Invalid request", err.issues);
    return;
  }

  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.message, err.details);
    return;
  }

  logger.error(err.stack ?? err.message);
  sendError(res, 500, "Internal server error");
}
