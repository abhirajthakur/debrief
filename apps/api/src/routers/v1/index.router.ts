import { Router } from "express";
import type { Container } from "../../container.js";
import { runsRouter } from "./runs.router.js";

export function v1Router(container: Container): Router {
  const router = Router();
  router.use("/runs", runsRouter(container));
  return router;
}
