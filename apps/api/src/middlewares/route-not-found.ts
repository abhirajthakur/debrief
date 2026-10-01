import type { Request, Response } from 'express';
import { sendError } from '../utils/api-response.js';

export function routeNotFound(req: Request, res: Response) {
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}
