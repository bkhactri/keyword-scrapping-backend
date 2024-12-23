import { Request } from 'express';
import {
  getRequestMock,
  getResponseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as reportController from '@src/controllers/report.controller';
import * as reportService from '@src/services/report.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import { BadRequestError } from '@src/utils/error.util';
import {
  mockKeywordId,
  mockReportKeywordDto,
} from '@tests/_mocks_/keyword-mock';
import { mockUserTokenPayload } from '@tests/_mocks_/user-mock';

jest.mock('@src/services/report.service');

describe('Report controller', () => {
  let requestMock: Request;
  const responseMock = getResponseMock();

  describe('getKeywordScrappedResult', () => {
    beforeEach(() => {
      requestMock = getRequestMock();
      requestMock.user = mockUserTokenPayload;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error if keyword id param is not valid', async () => {
      // Arrange
      requestMock.params.keywordId = 'mock-keyword-id';

      // Act
      await reportController.getKeywordScrappedResult(
        requestMock,
        responseMock,
        nextFuncMock,
      );

      // Assert
      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(
        new BadRequestError('Keyword id is not valid'),
      );
    });

    it('should return report keyword detail and return 200 if successful', async () => {
      // Arrange
      requestMock.params.keywordId = mockKeywordId.toString();

      (reportService.getKeywordScrappedResult as jest.Mock).mockResolvedValue(
        mockReportKeywordDto,
      );

      // Act
      await reportController.getKeywordScrappedResult(
        requestMock,
        responseMock,
        nextFuncMock,
      );

      // Act
      expect(reportService.getKeywordScrappedResult).toHaveBeenCalledWith(
        mockKeywordId,
      );
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith(mockReportKeywordDto);
    });
  });
});
