import { check, ValidationChain } from 'express-validator';

export const validateSignupMiddleware: ValidationChain[] = [
  check('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('firstName').isLength({ min: 1 }).withMessage('First name is required'),
  check('lastName').isLength({ min: 1 }).withMessage('Last name is required'),
];

export const validateLoginMiddleware: ValidationChain[] = [
  check('email').isEmail().withMessage('Invalid email address'),
  check('password').isLength({ min: 6 }).withMessage('Password is required'),
];
