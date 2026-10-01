import { loginInputSchema, signupInputSchema } from '@debrief/contracts';
import { Router } from 'express';
import { loginHandler, signupHandler } from '../../controllers/auth.controller.js';
import { validate } from '../../middlewares/validate.js';

export function authRouter(): Router {
  const router = Router();

  router.post('/signup', validate(signupInputSchema), signupHandler());
  router.post('/login', validate(loginInputSchema), loginHandler());

  return router;
}
