// routes/auth.route.ts
import express from 'express';
import * as authController from '@src/controllers/auth.controller';
import {
  validateLoginMiddleware,
  validateSignupMiddleware,
} from '@src/validators/auth.validator';
import { expressValidatorErrorHandler } from '@src/middlewares/error-handler.middleware';

const router = express.Router();

router.post(
  '/signup',
  validateSignupMiddleware,
  expressValidatorErrorHandler,
  authController.signup,
);

router.post(
  '/login',
  validateLoginMiddleware,
  expressValidatorErrorHandler,
  authController.login,
);

export { router as authRouter };
