import type { ReviewActionItemInput } from "@debrief/contracts";
import type { NextFunction, Request, Response } from "express";
import type { Container } from "../container.js";
import { reviewActionItem } from "../services/action-items.service.js";
import { sendSuccess } from "../utils/api-response.js";

export function reviewActionItemHandler(container: Container) {
  return async (
    req: Request<{ itemId: string }, unknown, ReviewActionItemInput>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { decision } = req.body;

      // biome-ignore lint/style/noNonNullAssertion: req.userId is guaranteed to be present after authentication
      const item = await reviewActionItem(req.params.itemId, req.userId!, decision, {
        slackAlertTool: container.slackAlertTool,
      });
      sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  };
}
