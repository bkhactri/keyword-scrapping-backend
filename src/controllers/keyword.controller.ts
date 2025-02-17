import { NextFunction, Request, Response } from 'express';
import * as keywordService from '@src/services/keyword.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import { BadRequestError } from '@src/utils/error.util';

export const getKeywords = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    const page = parseInt(req.query.page as string, 10) || 0;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
    const search = req.query.search as string | undefined;

    if (isNaN(page) || page < 0) {
      throw new BadRequestError('Invalid page number');
    }

    if (isNaN(pageSize) || pageSize < 1) {
      throw new BadRequestError('Invalid page size');
    }

    const result = await keywordService.getKeywords(
      userId as string,
      { page, pageSize },
      { search },
    );

    return res.status(HttpStatus.Ok).json(result);
  } catch (error) {
    return next(error);
  }
};
