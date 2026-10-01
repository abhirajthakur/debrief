import type { CreateRunInput } from '@debrief/contracts';
import type { NextFunction, Request, Response } from 'express';
import type { Container } from '../container.js';
import { createRun, getRunDetail, listRuns } from '../services/runs.service.js';
import { sendSuccess } from '../utils/api-response.js';

export function createRunHandler(container: Container) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Already validated and defaulted by validate(createRunInputSchema) in the router.
      const input = req.body as CreateRunInput;
      // req.userId is always set here — requireAuth runs before this handler.
      const output = await createRun(req.userId!, input, {
        actorProvider: container.actorProvider,
        actorProviderName: container.config.llmActor.provider,
        actorModel: container.config.llmActor.model,
      });
      sendSuccess(res, output, 201);
    } catch (err) {
      next(err);
    }
  };
}

export function listRunsHandler() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const runs = await listRuns(req.userId!);
      sendSuccess(res, runs);
    } catch (err) {
      next(err);
    }
  };
}

export function getRunHandler() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Already validated as a UUID by validate(runIdParamsSchema, 'params') in the router.
      const output = await getRunDetail(req.params.runId as string, req.userId!);
      sendSuccess(res, output);
    } catch (err) {
      next(err);
    }
  };
}
