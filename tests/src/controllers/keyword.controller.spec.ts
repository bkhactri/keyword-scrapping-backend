import { Request } from 'express';
import {
  getRequestMock,
  getResponseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as keywordController from '@src/controllers/keyword.controller';
import * as keywordService from '@src/services/keyword.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import { mockUserTokenPayload } from '@tests/_mocks_/user-mock';
import { mockKeywordList } from '@tests/_mocks_/keyword-mock';

jest.mock('@src/services/keyword.service');

describe('Keyword controller', () => {
  const responseMock = getResponseMock();
  let requestMock: Request;

  beforeEach(() => {
    requestMock = getRequestMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getKeywords', () => {
    describe('should throw error', () => {
      it('if page is not valid', async () => {
        // Arrange
        requestMock.query.page = '-1'; // -> Invalid page
        requestMock.query.pageSize = '20';

        // Act
        await keywordController.getKeywords(
          requestMock,
          responseMock,
          nextFuncMock,
        );

        // Assert
        expect(nextFuncMock).toHaveBeenCalled();
        expect(nextFuncMock).toHaveBeenCalledWith(
          new Error('Invalid page number'),
        );
      });

      it('if pageSize is not valid', async () => {
        // Arrange
        requestMock.query.page = '0';
        requestMock.query.pageSize = '-20'; // -> Invalid page size

        // Act
        await keywordController.getKeywords(
          requestMock,
          responseMock,
          nextFuncMock,
        );

        // Assert
        expect(nextFuncMock).toHaveBeenCalled();
        expect(nextFuncMock).toHaveBeenCalledWith(
          new Error('Invalid page size'),
        );
      });
    });

    describe('should return correct data', () => {
      beforeEach(() => {
        (keywordService.getKeywords as jest.Mock).mockResolvedValue(
          mockKeywordList,
        );
      });

      it('with pagination and empty search', async () => {
        // Arrange
        requestMock.user = mockUserTokenPayload;
        requestMock.query.page = '0';
        requestMock.query.pageSize = '20';

        // Act
        await keywordController.getKeywords(
          requestMock,
          responseMock,
          nextFuncMock,
        );

        // Assert
        expect(keywordService.getKeywords).toHaveBeenCalled();
        expect(keywordService.getKeywords).toHaveBeenCalledWith(
          mockUserTokenPayload.id,
          { page: 0, pageSize: 20 },
          { search: undefined },
        );
        expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
        expect(responseMock.json).toHaveBeenCalledWith(mockKeywordList);
      });

      it('with pagination and  search filter', async () => {
        // Arrange
        const mockSearchText = 'mock-keyword';
        requestMock.user = mockUserTokenPayload;
        requestMock.query.page = '0';
        requestMock.query.pageSize = '20';
        requestMock.query.search = mockSearchText;

        // Act
        await keywordController.getKeywords(
          requestMock,
          responseMock,
          nextFuncMock,
        );

        // Assert
        expect(keywordService.getKeywords).toHaveBeenCalled();
        expect(keywordService.getKeywords).toHaveBeenCalledWith(
          mockUserTokenPayload.id,
          { page: 0, pageSize: 20 },
          { search: mockSearchText },
        );
        expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
        expect(responseMock.json).toHaveBeenCalledWith(mockKeywordList);
      });

      it('with default pagination', async () => {
        // Arrange
        requestMock.user = mockUserTokenPayload;
        requestMock.query = {};

        // Act
        await keywordController.getKeywords(
          requestMock,
          responseMock,
          nextFuncMock,
        );

        // Assert
        expect(keywordService.getKeywords).toHaveBeenCalled();
        expect(keywordService.getKeywords).toHaveBeenCalledWith(
          mockUserTokenPayload.id,
          { page: 0, pageSize: 20 },
          { search: undefined },
        );
        expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
        expect(responseMock.json).toHaveBeenCalledWith(mockKeywordList);
      });
    });
  });
});
