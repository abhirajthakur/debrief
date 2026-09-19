import type { CreateRunInput } from "@debrief/contracts";
import type { NextFunction, Request, Response } from "express";
import type { Container } from "../container.js";
import { createRun, getRunDetail, listRuns } from "../services/runs.service.js";
import { sendSuccess } from "../utils/api-response.js";

export function createRunHandler(container: Container) {
  return async (req: Request<{}, {}, CreateRunInput>, res: Response, next: NextFunction) => {
    try {
      const output = await createRun(req.body, {
        actorProvider: container.actorProvider,
        actorProviderName: container.config.llmActor.provider,
        actorModel: container.config.llmActor.model,
        slackDigestTool: container.slackDigestTool,
      });
      sendSuccess(res, output, 201);
    } catch (err) {
      next(err);
    }
  };
}

export function listRunsHandler() {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const runs = await listRuns();
      sendSuccess(res, runs);
    } catch (err) {
      next(err);
    }
  };
}

export function getRunHandler() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const output = await getRunDetail(req.params.runId as string);
      sendSuccess(res, output);
    } catch (err) {
      next(err);
    }
  };
}
