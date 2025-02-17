import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { BadRequestError } from '@src/utils/error.util';

const upload = multer({
  storage: multer.memoryStorage(),
});

export const fileUploadMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return next(
        new BadRequestError(
          'Oops! Something went wrong. Please try uploading the file again',
        ),
      );
    }

    next();
  });
};
