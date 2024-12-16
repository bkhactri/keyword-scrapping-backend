import { NextFunction, Request, Response } from 'express';
import * as userService from '@src/services/user.service';
import { HttpStatus } from '@src/enums/http-status.enum';

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const userInfo = await userService.getUserInfo(userId as string);

    return res.status(HttpStatus.Ok).json(userInfo);
  } catch (error) {
    return next(error);
  }
};
