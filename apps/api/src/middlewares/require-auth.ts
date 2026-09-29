import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";
import { sendError } from "../utils/api-response.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    sendError(res, 401, "Missing or invalid Authorization header");
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    sendError(res, 401, "Invalid or expired token");
  }
}
