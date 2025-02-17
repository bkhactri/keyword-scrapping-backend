import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as reportController from '@src/controllers/report.controller';
import * as reportService from '@src/services/report.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import { BadRequestError } from '@src/utils/error.util';

jest.mock('@src/services/report.service');

describe('Report controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserInfo', () => {
    const mockUser = {
      id: 'mock-user-id',
      email: 'mock-user-email',
      firstName: 'mock-first-name',
      lastName: 'mock-last-name',
    };

    it('should throw error if keyword id param is not valid', async () => {
      requestMock.user = mockUser;
      requestMock.params.keywordId = 'mock-keyword';

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
      requestMock.params.keywordId = '1010';

      (reportService.getKeywordScrappedResult as jest.Mock).mockResolvedValue({
        keywordId: 1,
        keyword: 'key1',
        totalAds: 1,
        totalLinks: 10,
        htmlCachePage: 'sanitized_<html></html>',
        createdAt: 'mock-created-at',
        updatedAt: 'mock-updated-at',
      });

      await reportController.getKeywordScrappedResult(
        requestMock,
        responseMock,
        nextFuncMock,
      );

      expect(reportService.getKeywordScrappedResult).toHaveBeenCalledWith(
        mockUser.id,
        1010,
      );
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith({
        keywordId: 1,
        keyword: 'key1',
        totalAds: 1,
        totalLinks: 10,
        htmlCachePage: 'sanitized_<html></html>',
        createdAt: 'mock-created-at',
        updatedAt: 'mock-updated-at',
      });
    });
  });
});
