import { NextFunction, Request, Response } from 'express';
import * as fileService from '@src/services/file.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import { BadRequestError } from '@src/utils/error.util';

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file;
    if (!file) {
      throw new BadRequestError('Please upload a CSV file');
    }

    // Parse csv
    const keywords = await fileService.parseCSV(file.buffer);

    // Validate keywords
    fileService.validateKeywords(keywords);

    return res.status(HttpStatus.Ok).json({ keywords });
  } catch (error) {
    next(error);
  }
};
