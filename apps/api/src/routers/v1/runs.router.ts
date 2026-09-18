import { CreateRunInputSchema } from "@debrief/contracts";
import { Router } from "express";
import type { Container } from "../../container.js";
import { createRunHandler } from "../../controllers/runs.controller.js";
import { validate } from "../../middlewares/validate.js";

export function runsRouter(container: Container): Router {
  const router = Router();
  router.post("/", validate(CreateRunInputSchema), createRunHandler(container));
  return router;
}
