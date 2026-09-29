import type { LoginInput, SignupInput } from "@debrief/contracts";
import type { NextFunction, Request, Response } from "express";
import { login, signup } from "../services/auth.service.js";
import { sendSuccess } from "../utils/api-response.js";

export function signupHandler() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await signup(req.body as SignupInput);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  };
}

export function loginHandler() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await login(req.body as LoginInput);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}
