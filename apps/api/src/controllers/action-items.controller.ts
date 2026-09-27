import type { NextFunction, Request, Response } from "express";
import type { Container } from "../container.js";
import type { ReviewActionItemBody } from "../schemas/action-items.schema.js";
import { reviewActionItem } from "../services/action-items.service.js";
import { sendSuccess } from "../utils/api-response.js";

export function reviewActionItemHandler(container: Container) {
  return async (
    req: Request<{ itemId: string }, unknown, ReviewActionItemBody>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { decision } = req.body;
      const item = await reviewActionItem(req.params.itemId, decision, {
        slackAlertTool: container.slackAlertTool,
      });

      sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  };
}
