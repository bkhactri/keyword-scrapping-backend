import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as fileController from '@src/controllers/file.controller';
import { AppError } from '@src/utils/error.util';
import * as fileService from '@src/services/file.service';
import * as keywordService from '@src/services/keyword.service';
import { mockKeywords } from '@tests/_mocks_/context-mock';

jest.mock('bullmq');
jest.mock('ioredis');
jest.mock('express-validator');
jest.mock('@src/services/auth.service');
jest.mock('@src/services/file.service', () => ({
  parseCSV: jest.fn(),
  validateKeywords: jest.fn(),
}));
jest.mock('@src/services/keyword.service', () => ({
  createBulk: jest.fn(),
}));

describe('File controller', () => {
  const mockParseCSV = fileService.parseCSV as jest.Mock;
  const mockCreateBulk = keywordService.createBulk as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should return 400 with validation errors if validation fails', async () => {
      await fileController.uploadFile(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFuncMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please upload a CSV file' }),
      );
    });

    it('should return 400 with validation errors if save keywords errors', async () => {
      requestMock.file = {
        mimetype: 'application/json',
      } as Express.Multer.File;

      mockParseCSV.mockResolvedValue(mockKeywords);
      mockCreateBulk.mockResolvedValue([]);

      await fileController.uploadFile(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFuncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Save keywords error, can not continue to process',
        }),
      );
    });
  });
});
