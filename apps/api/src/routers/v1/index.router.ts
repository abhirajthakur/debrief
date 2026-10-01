import { Router } from 'express';
import type { Container } from '../../container.js';
import { actionItemsRouter } from './action-items.router.js';
import { authRouter } from './auth.router.js';
import { integrationsRouter } from './integrations.router.js';
import { runsRouter } from './runs.router.js';

export function v1Router(container: Container): Router {
  const router = Router();

  router.use('/auth', authRouter());
  router.use('/runs', runsRouter(container));
  router.use('/action-items', actionItemsRouter());
  router.use('/integrations', integrationsRouter());

  return router;
}
