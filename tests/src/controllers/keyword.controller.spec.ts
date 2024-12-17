import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as keywordController from '@src/controllers/keyword.controller';
import * as keywordService from '@src/services/keyword.service';
import { HttpStatus } from '@src/enums/http-status.enum';

jest.mock('@src/services/keyword.service');

describe('Keyword controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getKeywords', () => {
    const mockUser = {
      id: 'mock-user-id',
      email: 'mock-user-email',
      firstName: 'mock-first-name',
      lastName: 'mock-last-name',
    };

    it('should throw error if page is not valid', async () => {
      requestMock.query.page = '-1';
      requestMock.query.pageSize = '20';

      await keywordController.getKeywords(
        requestMock,
        responseMock,
        nextFuncMock,
      );

      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(
        new Error('Invalid page number'),
      );
    });

    it('should throw error if pageSize is not valid', async () => {
      requestMock.query.page = '0';
      requestMock.query.pageSize = '-20';

      await keywordController.getKeywords(
        requestMock,
        responseMock,
        nextFuncMock,
      );

      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(new Error('Invalid page size'));
    });

    it('should return correct data with pagination and empty search', async () => {
      requestMock.user = mockUser;
      requestMock.query.page = '0';
      requestMock.query.pageSize = '20';
      (keywordService.getKeywords as jest.Mock).mockResolvedValue({
        total: 1,
        keywords: [
          {
            id: 1,
          },
        ],
        page: 0,
        pageSize: 20,
      });

      await keywordController.getKeywords(
        requestMock,
        responseMock,
        nextFuncMock,
      );

      expect(keywordService.getKeywords).toHaveBeenCalled();
      expect(keywordService.getKeywords).toHaveBeenCalledWith(
        'mock-user-id',
        { page: 0, pageSize: 20 },
        { search: undefined },
      );
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith({
        total: 1,
        keywords: [
          {
            id: 1,
          },
        ],
        page: 0,
        pageSize: 20,
      });
    });

    it('should return correct data with pagination and  search filter', async () => {
      requestMock.user = mockUser;
      requestMock.query.page = '0';
      requestMock.query.pageSize = '20';
      requestMock.query.search = 'mock-search';
      (keywordService.getKeywords as jest.Mock).mockResolvedValue({
        total: 1,
        keywords: [
          {
            id: 1,
          },
        ],
        page: 0,
        pageSize: 20,
      });

      await keywordController.getKeywords(
        requestMock,
        responseMock,
        nextFuncMock,
      );

      expect(keywordService.getKeywords).toHaveBeenCalled();
      expect(keywordService.getKeywords).toHaveBeenCalledWith(
        'mock-user-id',
        { page: 0, pageSize: 20 },
        { search: 'mock-search' },
      );
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith({
        total: 1,
        keywords: [
          {
            id: 1,
          },
        ],
        page: 0,
        pageSize: 20,
      });
    });

    it('should return correct data with default pagination', async () => {
      requestMock.user = mockUser;
      requestMock.query = {};
      (keywordService.getKeywords as jest.Mock).mockResolvedValue({
        total: 1,
        keywords: [
          {
            id: 1,
          },
        ],
        page: 0,
        pageSize: 20,
      });

      await keywordController.getKeywords(
        requestMock,
        responseMock,
        nextFuncMock,
      );

      expect(keywordService.getKeywords).toHaveBeenCalled();
      expect(keywordService.getKeywords).toHaveBeenCalledWith(
        'mock-user-id',
        { page: 0, pageSize: 20 },
        { search: undefined },
      );
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith({
        total: 1,
        keywords: [
          {
            id: 1,
          },
        ],
        page: 0,
        pageSize: 20,
      });
    });
  });
});
