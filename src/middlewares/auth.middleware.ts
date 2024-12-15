/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@src/utils/error.util';
import { UserTokenPayload } from '@src/interfaces/user.interface';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split(' ')[1]
      : '';

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    try {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as UserTokenPayload;

      if (!decodedToken) {
        throw new UnauthorizedError('Invalid token supplied');
      }

      req.user = decodedToken;

      next();
    } catch (error) {
      throw new UnauthorizedError('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
