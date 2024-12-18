import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as reportController from '@src/controllers/report.controller';
import * as reportService from '@src/services/report.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import { BadRequestError } from '@src/utils/error.util';
import {
  mockKeywordId,
  mockSearchResult,
  mockUser,
} from '@tests/_mocks_/context-mock';

jest.mock('@src/services/report.service');

describe('Report controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getKeywordScrappedResult', () => {
    it('should throw error if keyword id param is not valid', async () => {
      const mockInvalidKeywordId = 'mock-keyword-id';
      requestMock.user = mockUser;
      requestMock.params.keywordId = mockInvalidKeywordId;

      await reportController.getKeywordScrappedResult(
        requestMock,
        responseMock,
        nextFuncMock,
      );

      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(
        new BadRequestError('Keyword id is not valid'),
      );
    });

    it('should return report keyword detail and return 200 if successful', async () => {
      requestMock.user = mockUser;
      requestMock.params.keywordId = mockKeywordId.toString();

      (reportService.getKeywordScrappedResult as jest.Mock).mockResolvedValue(
        mockSearchResult,
      );

      await reportController.getKeywordScrappedResult(
        requestMock,
        responseMock,
        nextFuncMock,
      );

      expect(reportService.getKeywordScrappedResult).toHaveBeenCalledWith(
        mockUser.id,
        Number(mockKeywordId),
      );
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith(mockSearchResult);
    });
  });
});
