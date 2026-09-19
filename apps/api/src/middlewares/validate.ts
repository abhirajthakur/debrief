import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { sendError } from "../utils/api-response.js";

type RequestPart = "body" | "query" | "params";

export const validate = (schema: ZodType, part: RequestPart = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      sendError(res, 400, "Invalid request", result.error.issues);
      return;
    }

    const parsed = result.data;

    if (part === "query") {
      // Express 5 made req.query a getter-only property on the prototype —
      // a plain assignment throws. Object.defineProperty shadows it on the
      // instance instead.
      Object.defineProperty(req, "query", {
        value: parsed,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else if (part === "body") {
      req.body = parsed;
    } else {
      req.params = parsed as typeof req.params;
    }

    next();
  };
};
