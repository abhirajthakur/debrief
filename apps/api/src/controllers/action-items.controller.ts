import type { ReviewActionItemInput } from '@debrief/contracts';
import type { NextFunction, Request, Response } from 'express';
import { reviewActionItem } from '../services/action-items.service.js';
import { sendSuccess } from '../utils/api-response.js';

export function reviewActionItemHandler() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { decision } = req.body as ReviewActionItemInput;
      // req.userId is always set here — requireAuth runs before this handler.
      const item = await reviewActionItem(req.params.itemId as string, req.userId!, decision);
      sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  };
}
