import SearchResultModel from '@src/models/search-result.model';
import HtmlPageCacheModel from '@src/models/html-page-cache.model';
import sequelize from '@src/config/database';
import { expectException } from '@tests/helpers/expect-exception.helper';
import * as reportService from '@src/services/report.service';
import * as keywordService from '@src/services/keyword.service';
import { AppError } from '@src/utils/error.util';

jest.mock('@src/services/keyword.service');
jest.mock('@src/models/search-result.model', () => {
  const mockSearchResultModel = {
    create: jest.fn(),
    findOne: jest.fn(),
  };
  return jest.fn(() => mockSearchResultModel);
});
jest.mock('@src/models/html-page-cache.model', () => {
  const mockHtmlPageCacheModel = {
    create: jest.fn(),
    findByPk: jest.fn(),
  };
  return jest.fn(() => mockHtmlPageCacheModel);
});
jest.mock('jsdom', () => {
  return {
    JSDOM: jest.fn().mockImplementation(() => {
      return {
        window: {
          document: {},
        },
      };
    }),
  };
});

jest.mock('dompurify', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sanitize: jest.fn((html) => `sanitized_${html}`),
    };
  });
});

describe('Report service', () => {
  const mockContext = {
    userId: 'mock-user-id',
    keyword: 'key1',
    keywordId: 1,
  };
  const mockPayload = {
    keywordId: 1,
    totalAds: 6,
    totalLinks: 120,
    htmlCacheId: 1,
  };
  const mockHtmlPageCache = 'mock-html-page-cache';
  const mockSearchResultCreate = SearchResultModel(sequelize)
    .create as jest.Mock;
  const mockSearchResultFindOne = SearchResultModel(sequelize)
    .findOne as jest.Mock;
  const mockHtmlPageCacheCreate = HtmlPageCacheModel(sequelize)
    .create as jest.Mock;
  const mockHtmlPageCacheFindByPk = HtmlPageCacheModel(sequelize)
    .findByPk as jest.Mock;

  describe('saveGoogleScrapeResult', () => {
    it('should return correct data after saved', async () => {
      mockHtmlPageCacheCreate.mockResolvedValue({
        dataValues: {
          id: 1,
        },
      });
      mockSearchResultCreate.mockResolvedValue({
        dataValues: {
          id: 1,
          ...mockPayload,
          createdAt: 'mock-created-at',
          updatedAt: 'mock-updated-at',
        },
      });

      const result = await reportService.saveGoogleScrapeResult(mockContext, {
        ...mockPayload,
        htmlCachePage: mockHtmlPageCache,
      });

      expect(mockSearchResultCreate).toHaveBeenCalled();
      expect(mockSearchResultCreate).toHaveBeenCalledWith(mockPayload);
      expect(mockHtmlPageCacheCreate).toHaveBeenCalled();
      expect(mockHtmlPageCacheCreate).toHaveBeenCalledWith({
        html: mockHtmlPageCache,
      });
      expect(result).toMatchObject({
        id: 1,
        ...mockPayload,
        createdAt: 'mock-created-at',
        updatedAt: 'mock-updated-at',
      });
    });
  });

  describe('saveSearchResultByKeyword', () => {
    it('should throw error if search result created fail', async () => {
      mockSearchResultCreate.mockRejectedValue(new Error('oops'));

      await expectException({
        fn: () => reportService.saveSearchResultByKeyword(mockPayload),
        exceptionInstance: Error,
        message: 'oops',
      });
    });

    it('should return correct data after successfully created', async () => {
      mockSearchResultCreate.mockResolvedValue({
        dataValues: {
          id: 1,
          ...mockPayload,
          createdAt: 'mock-created-at',
          updatedAt: 'mock-updated-at',
        },
      });

      const result = await reportService.saveSearchResultByKeyword(mockPayload);

      expect(mockSearchResultCreate).toHaveBeenCalled();
      expect(mockSearchResultCreate).toHaveBeenCalledWith(mockPayload);
      expect(result).toMatchObject({
        id: 1,
        ...mockPayload,
        createdAt: 'mock-created-at',
        updatedAt: 'mock-updated-at',
      });
    });
  });

  describe('saveHtmlPageCache', () => {
    it('should throw error if html page cache created fail', async () => {
      mockHtmlPageCacheCreate.mockRejectedValue(new Error('oops'));

      await expectException({
        fn: () => reportService.saveHtmlPageCache(mockHtmlPageCache),
        exceptionInstance: Error,
        message: 'oops',
      });
    });

    it('should return correct data after successfully created', async () => {
      mockHtmlPageCacheCreate.mockResolvedValue({
        dataValues: {
          id: 1,
        },
      });

      const result = await reportService.saveHtmlPageCache(mockHtmlPageCache);

      expect(mockHtmlPageCacheCreate).toHaveBeenCalled();
      expect(mockHtmlPageCacheCreate).toHaveBeenCalledWith({
        html: mockHtmlPageCache,
      });
      expect(result).toEqual(1);
    });
  });

  describe('getKeywordScrappedResult', () => {
    it('should throw error if keyword not found', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue(null);

      await expectException({
        fn: () =>
          reportService.getKeywordScrappedResult(
            mockContext.userId,
            mockContext.keywordId,
          ),
        exceptionInstance: AppError,
        message: 'Keyword not found',
      });
    });

    it('should throw error if keyword status is not completed', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        id: 1,
        status: 'pending',
      });

      await expectException({
        fn: () =>
          reportService.getKeywordScrappedResult(
            mockContext.userId,
            mockContext.keywordId,
          ),
        exceptionInstance: AppError,
        message: 'Can not get in-completed keyword',
      });
    });

    it('should throw error if search result not found', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        id: 1,
        status: 'completed',
      });
      mockSearchResultFindOne.mockResolvedValue(null);

      await expectException({
        fn: () =>
          reportService.getKeywordScrappedResult(
            mockContext.userId,
            mockContext.keywordId,
          ),
        exceptionInstance: AppError,
        message: 'Can not found search result of keyword',
      });
    });

    it('should throw error if html page cache id not attached', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        id: 1,
        status: 'completed',
      });
      mockSearchResultFindOne.mockResolvedValue({
        dataValues: {
          htmlCacheId: null,
        },
      });

      await expectException({
        fn: () =>
          reportService.getKeywordScrappedResult(
            mockContext.userId,
            mockContext.keywordId,
          ),
        exceptionInstance: AppError,
        message: 'No html page cache attached',
      });
    });

    it('should throw error if html page cache id not found', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        id: 1,
        status: 'completed',
      });
      mockSearchResultFindOne.mockResolvedValue({
        dataValues: {
          htmlCacheId: 123,
        },
      });
      mockHtmlPageCacheFindByPk.mockResolvedValue(null);

      await expectException({
        fn: () =>
          reportService.getKeywordScrappedResult(
            mockContext.userId,
            mockContext.keywordId,
          ),
        exceptionInstance: AppError,
        message: 'Can not found html page cache of keyword',
      });
    });

    it('should return correct keyword scrapped result', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        id: 1,
        keyword: 'key1',
        status: 'completed',
        createdAt: 'mock-created-at',
        updatedAt: 'mock-updated-at',
      });
      mockSearchResultFindOne.mockResolvedValue({
        dataValues: {
          totalAds: 1,
          totalLinks: 10,
          htmlCacheId: 123,
        },
      });
      mockHtmlPageCacheFindByPk.mockResolvedValue({
        dataValues: {
          html: '<html></html>',
        },
      });

      const result = await reportService.getKeywordScrappedResult(
        mockContext.userId,
        mockContext.keywordId,
      );

      expect(keywordService.getByKeywordId).toHaveBeenCalledWith(
        mockContext.keywordId,
      );
      expect(mockSearchResultFindOne).toHaveBeenCalledWith({
        where: {
          keywordId: 1,
        },
      });
      expect(mockHtmlPageCacheFindByPk).toHaveBeenCalledWith(123);
      expect(result).toMatchObject({
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
