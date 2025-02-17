/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@src/utils/error.util';
import { logger } from '@src/config/logger';
import { validationResult } from 'express-validator';

export const expressValidatorErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = errors.array()[0];
    return next({
      type: error?.type,
      message: error?.msg,
    });
  }

  next();
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  if (err instanceof AppError) {
    logger.error(
      `Error ${err.statusCode}: ${err.message}`,
      err.details ? { details: err.details } : {},
    );

    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  } else {
    logger.error({ err }, 'Unexpected Error');

    return res.status(500).json({
      message: err.message || 'Something went wrong!',
    });
  }
};
