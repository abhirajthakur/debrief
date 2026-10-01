import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { requestContext } from '../lib/async-context.js';

const HEADER = 'x-correlation-id';

export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const id = req.header(HEADER) ?? randomUUID();
  res.setHeader(HEADER, id);
  requestContext.run({ correlationId: id }, () => next());
}
