import { NextFunction, Request, Response } from 'express';
import { matchedData } from 'express-validator';
import * as authService from '@src/services/auth.service';
import {
  UserSignUpPayload,
  UserSignInPayload,
} from '@src/interfaces/user.interface';
import { HttpStatus } from '@src/enums/http-status.enum';

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
  try {
    const validatedData = matchedData(req) as UserSignInPayload;
    const authenticatedInfo = await authService.login(validatedData);

    return res.status(HttpStatus.Ok).json(authenticatedInfo);
  } catch (error) {
    return next(error);
  }
};
