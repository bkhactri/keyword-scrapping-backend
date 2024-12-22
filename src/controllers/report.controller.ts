import { NextFunction, Request, Response } from 'express';
import * as reportService from '@src/services/report.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import { BadRequestError } from '../utils/error.util';

export const getKeywordScrappedResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const keywordId = parseInt(req.params?.keywordId as string, 10);

    if (!keywordId) {
      throw new BadRequestError('Keyword id is not valid');
    }

    const result = await reportService.getKeywordScrappedResult(keywordId);

    return res.status(HttpStatus.Ok).json(result);
  } catch (error) {
    return next(error);
  }
};
