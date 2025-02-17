import { NextFunction, Request, Response } from 'express';
import * as fileService from '@src/services/file.service';
import * as keywordService from '@src/services/keyword.service';
import * as queueService from '@src/services/queue.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import { BadRequestError } from '@src/utils/error.util';
import { KeywordStatus } from '@src/enums/keyword.enum';

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const file = req.file;
    if (!file) {
      throw new BadRequestError('Please upload a CSV file');
    }

    // Parse csv
    const keywords = await fileService.parseCSV(file.buffer);

    // Validate keywords
    fileService.validateKeywords(keywords);

    // Store keywords
    const savedKeywords = await keywordService.createBulk(userId, keywords);

    if (!savedKeywords.length) {
      throw new BadRequestError(
        'Save keywords error, can not continue to process',
      );
    }

    // Enqueue keyword to process
    savedKeywords.forEach((keyword) => {
      if (keyword.status === KeywordStatus.Pending) {
        queueService.enqueueKeywordProcessing({
          userId,
          keyword: keyword.keyword,
          keywordId: keyword.id,
        });
      }
    });

    return res.status(HttpStatus.Ok).json({ keywords });
  } catch (error) {
    next(error);
  }
};
