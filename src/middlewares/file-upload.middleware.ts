import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { BadRequestError } from '@src/utils/error.util';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
});

export const fileUploadMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new BadRequestError('File size exceeds the limit 1MB'));
      }

      return next(
        new BadRequestError(
          'Oops! Something went wrong. Please try uploading the file again',
        ),
      );
    }

    next();
  });
};

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

    next();
  } catch (error) {
    next(error);
  }
};
