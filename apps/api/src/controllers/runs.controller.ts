/** biome-ignore-all lint/style/noNonNullAssertion: req.userId is guaranteed to be present after authentication */
import type { CreateRunInput } from "@debrief/contracts";
import type { NextFunction, Request, Response } from "express";
import type { Container } from "../container.js";
import { createRun, getRunDetail, listRuns } from "../services/runs.service.js";
import { sendSuccess } from "../utils/api-response.js";

export function createRunHandler(container: Container) {
  return async (
    req: Request<unknown, unknown, CreateRunInput>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const input = req.body;
      const output = await createRun(req.userId!, input, {
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
  return async (req: Request<{ runId: string }>, res: Response, next: NextFunction) => {
    try {
      const output = await getRunDetail(req.params.runId, req.userId!);
      sendSuccess(res, output);
    } catch (err) {
      next(err);
    }
  };
}
