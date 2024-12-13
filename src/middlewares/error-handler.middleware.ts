/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';
import { logger } from '../config/logger';

const errorHandler = (
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
    logger.error('Unexpected Error:', err);

    return res.status(500).json({
      message: err.message || 'Something went wrong!',
    });
  }
};

export default errorHandler;
