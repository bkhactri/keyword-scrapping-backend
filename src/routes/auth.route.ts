// routes/auth.route.ts
import express from 'express';
import * as authController from '@src/controllers/auth.controller';
import { check } from 'express-validator';

const router = express.Router();

router.post(
  '/signup',
  [
    check('email').isEmail().normalizeEmail(),
    check('password')
      .isLength({ min: 6 })
      .withMessage('must be at least 5 chars long'),
    check('firstName').isLength({ min: 1 }).withMessage('provide first name'),
    check('lastName').isLength({ min: 1 }).withMessage('provide last name'),
  ],
  authController.signup,
);

router.post(
  '/login',
  [check('email').isEmail(), check('password').exists()],
  authController.login,
);

export { router as authRouter };
