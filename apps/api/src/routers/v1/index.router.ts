import { Router } from "express";
import type { Container } from "../../container.js";
import { actionItemsRouter } from "./action-items.router.js";
import { runsRouter } from "./runs.router.js";

export function v1Router(container: Container): Router {
  const router = Router();

  router.use("/runs", runsRouter(container));
  router.use("/action-items", actionItemsRouter(container));

  return router;
}
