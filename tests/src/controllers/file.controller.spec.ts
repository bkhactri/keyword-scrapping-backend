import {
  getResponseMock,
  getRequestMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as fileController from '@src/controllers/file.controller';
import { AppError } from '@src/utils/error.util';
import * as fileService from '@src/services/file.service';
import * as keywordService from '@src/services/keyword.service';
import * as queueService from '@src/services/queue.service';
import {
  mockKeywordAttributes,
  mockKeywordRawList,
} from '@tests/_mocks_/keyword-mock';
import { mockUserId, mockUserTokenPayload } from '@tests/_mocks_/user-mock';
import { KeywordStatus } from '@src/enums/keyword.enum';

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
jest.mock('@src/services/queue.service', () => ({
  enqueueKeywordProcessing: jest.fn(),
}));

describe('File controller', () => {
  const requestMock = getRequestMock();
  const responseMock = getResponseMock();
  const mockParseCSV = fileService.parseCSV as jest.Mock;
  const mockCreateBulk = keywordService.createBulk as jest.Mock;

  describe('uploadFile', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return 400 with validation errors if not provide file', async () => {
      // Arrange - skip due to simulate error issue

      // Act
      await fileController.uploadFile(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(nextFuncMock).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFuncMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please upload a CSV file' }),
      );
    });

    it('should return 400 with validation errors if save keywords errors', async () => {
      // Arrange
      requestMock.file = {
        mimetype: 'application/json',
      } as Express.Multer.File;

      mockParseCSV.mockResolvedValue(mockKeywordRawList);
      mockCreateBulk.mockResolvedValue([]);

      // Act
      await fileController.uploadFile(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(nextFuncMock).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFuncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Save keywords error, can not continue to process',
        }),
      );
    });

    it('should enqueue saved keywords for processing', async () => {
      // Arrange
      requestMock.user = mockUserTokenPayload;
      requestMock.file = {
        mimetype: 'application/json',
      } as Express.Multer.File;

      mockParseCSV.mockResolvedValue(mockKeywordRawList);
      mockCreateBulk.mockResolvedValue(
        mockKeywordRawList.map((keyword, index) => ({
          id: index + 1,
          userId: mockUserId,
          status: KeywordStatus.Pending,
          keyword,
        })),
      );

      // Act
      await fileController.uploadFile(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(queueService.enqueueKeywordProcessing).toHaveBeenCalledTimes(
        mockKeywordRawList.length,
      );
      mockKeywordRawList.forEach((keyword, index) => {
        expect(queueService.enqueueKeywordProcessing).toHaveBeenCalledWith({
          userId: mockUserTokenPayload.id,
          keyword,
          keywordId: index + 1,
        });
      });
    });
  });
});
