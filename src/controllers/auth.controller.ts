import { NextFunction, Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
import * as authService from '../services/auth.service';
import {
  UserSignUpPayload,
  UserSignInPayload,
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
    const validatedData = matchedData(req) as UserSignUpPayload;
    const newUserInfo = await authService.signup(validatedData);

    return res.status(HttpStatus.Created).json(newUserInfo);
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
    const validatedData = matchedData(req) as UserSignInPayload;
    const authenticatedInfo = await authService.login(validatedData);

    return res.status(HttpStatus.Ok).json(authenticatedInfo);
  } catch (error) {
    return next(error);
  }
};
