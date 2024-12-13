// routes/auth.route.ts
import express from 'express';
import * as authController from '../controllers/auth.controller';
import { check } from 'express-validator';

const router = express.Router();

router.post(
  '/signup',
  [
    check('email').isEmail().normalizeEmail(),
    check('password')
      .isLength({ min: 6 })
      .withMessage('must be at least 5 chars long'),
  ],
  authController.signup,
);

router.post(
  '/login',
  [check('email').isEmail(), check('password').exists()],
  authController.login,
);

export { router as authRouter };
