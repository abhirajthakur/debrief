import { Router } from "express";
import type { Container } from "../../container.js";
import { reviewActionItemHandler } from "../../controllers/action-items.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  actionItemIdParamsSchema,
  reviewActionItemBodySchema,
} from "../../schemas/action-items.schema.js";

export function actionItemsRouter(container: Container): Router {
  const router = Router();

  router.patch(
    "/:itemId",
    validate(actionItemIdParamsSchema, "params"),
    validate(reviewActionItemBodySchema),
    reviewActionItemHandler(container),
  );

  return router;
}
