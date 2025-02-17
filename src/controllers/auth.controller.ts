import { NextFunction, Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
import * as authService from '../services/auth.service';
import {
  UserSignUpAttributes,
  UserSignInAttributes,
} from '../interfaces/user.interface';
import { HttpStatus } from '../enums/http-status.enum';

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errors.array()[0]);
  }

  try {
    const validatedData = matchedData(req) as UserSignUpAttributes;
    const newUser = await authService.signup(validatedData);

    return res.status(HttpStatus.Created).json(newUser);
  } catch (error) {
    return next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errors.array()[0]);
  }

  try {
    const validatedData = matchedData(req) as UserSignInAttributes;
    const token = await authService.login(validatedData);

    return res.status(HttpStatus.Ok).json({ token });
  } catch (error) {
    return next(error);
  }
};
