import { createRunInputSchema } from "@debrief/contracts";
import { Router } from "express";
import type { Container } from "../../container.js";
import {
  createRunHandler,
  getRunHandler,
  listRunsHandler,
} from "../../controllers/runs.controller.js";
import { validate } from "../../middlewares/validate.js";

export function runsRouter(container: Container): Router {
  const router = Router();

  router.post("/", validate(createRunInputSchema), createRunHandler(container));
  router.get("/", listRunsHandler());
  router.get("/:runId", getRunHandler());

  return router;
}
