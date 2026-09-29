import type { ReviewActionItemInput } from "@debrief/contracts";
import type { NextFunction, Request, Response } from "express";
import type { Container } from "../container.js";
import { reviewActionItem } from "../services/action-items.service.js";
import { sendSuccess } from "../utils/api-response.js";

export function reviewActionItemHandler(container: Container) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { decision } = req.body as ReviewActionItemInput;
      const item = await reviewActionItem(req.params.itemId as string, decision, {
        slackAlertTool: container.slackAlertTool,
      });
      sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  };
}
