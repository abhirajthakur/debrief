import { reviewActionItemInputSchema } from "@debrief/contracts";
import { Router } from "express";
import { z } from "zod";
import type { Container } from "../../container.js";
import { reviewActionItemHandler } from "../../controllers/action-items.controller.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { validate } from "../../middlewares/validate.js";

const itemIdParamsSchema = z.object({ itemId: z.uuid() });

export function actionItemsRouter(container: Container): Router {
  const router = Router();

  router.use(requireAuth);

  router.patch(
    "/:itemId",
    validate(itemIdParamsSchema, "params"),
    validate(reviewActionItemInputSchema),
    reviewActionItemHandler(container),
  );

  return router;
}
