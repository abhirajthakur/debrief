import { createRunInputSchema } from '@debrief/contracts';
import { Router } from 'express';
import { z } from 'zod';
import type { Container } from '../../container.js';
import {
  createRunHandler,
  getRunHandler,
  listRunsHandler,
} from '../../controllers/runs.controller.js';
import { requireAuth } from '../../middlewares/require-auth.js';
import { validate } from '../../middlewares/validate.js';

// URL params only matter to the server (a client just builds a string), so
// this lives next to the route that uses it rather than in contracts.
const runIdParamsSchema = z.object({ runId: z.uuid() });

export function runsRouter(container: Container): Router {
  const router = Router();

  router.use(requireAuth);

  router.post('/', validate(createRunInputSchema), createRunHandler(container));
  router.get('/', listRunsHandler());
  router.get('/:runId', validate(runIdParamsSchema, 'params'), getRunHandler());

  return router;
}
