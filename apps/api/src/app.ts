import cors from 'cors';
import type { Express } from 'express';
import express from 'express';
import { env } from './config/env.js';
import type { Container } from './container.js';
import { correlationId } from './middlewares/correlation-id.js';
import { errorHandler } from './middlewares/error-handler.js';
import { routeNotFound } from './middlewares/route-not-found.js';
import { v1Router } from './routers/v1/index.router.js';

export function createApp(container: Container): Express {
  const app = express();

  app.use(correlationId);
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/v1', v1Router(container));

  app.use(routeNotFound);
  app.use(errorHandler);

  return app;
}
