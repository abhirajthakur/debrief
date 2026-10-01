import { Router } from 'express';
import {
  slackCallbackHandler,
  slackConnectHandler,
} from '../../controllers/integrations.controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';

export function integrationsRouter(): Router {
  const router = Router();

  router.get('/slack/connect', requireAuth, slackConnectHandler());
  router.get('/slack/callback', slackCallbackHandler()); // public — Slack redirects here directly

  return router;
}
