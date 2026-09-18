import type { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  res.status(statusCode).json({ success: true, data });
}

export function sendError(res: Response, statusCode: number, message: string, details?: unknown) {
  res.status(statusCode).json({ success: false, error: message, details });
}
