import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '@src/utils/error.util';

const MAXIMUM_FIlE_SIZE = 1 * 1024 * 1024; // 1MB

export const validateFileTypeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file;
    if (!file || file.mimetype !== 'text/csv') {
      throw new BadRequestError('Please upload a CSV file');
    }

    if (file.size > MAXIMUM_FIlE_SIZE) {
      throw new BadRequestError('File size exceeds the limit 1MB');
    }

    next();
  } catch (error) {
    next(error);
  }
};
