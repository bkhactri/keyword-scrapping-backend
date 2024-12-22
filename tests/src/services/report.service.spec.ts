import SearchResultModel from '@src/models/search-result.model';
import HtmlPageCacheModel from '@src/models/html-page-cache.model';
import sequelize from '@src/config/database';
import { expectException } from '@tests/helpers/expect-exception.helper';
import * as reportService from '@src/services/report.service';
import * as keywordService from '@src/services/keyword.service';
import { AppError } from '@src/utils/error.util';
import {
  mockKeyword,
  mockKeywordId,
  mockScrapeContext,
  mockSearchResultWithHtmlCachePage,
} from '@tests/_mocks_/context-mock';
import { KeywordStatus } from '@src/enums/keyword.enum';

jest.mock('@src/services/keyword.service');
jest.mock('@src/models/keyword.model', () => {
  const mockKeywordModel = {
    hasOne: jest.fn(),
  };
  return jest.fn(() => mockKeywordModel);
});
jest.mock('@src/models/search-result.model', () => {
  const mockSearchResultModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    belongsTo: jest.fn(),
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
  const mockPayload = {
    keywordId: 1,
    totalAds: 6,
    totalLinks: 120,
    htmlCacheId: 1,
  };
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

      const result = await reportService.saveGoogleScrapeResult(
        mockScrapeContext,
        {
          ...mockPayload,
          htmlCachePage: mockSearchResultWithHtmlCachePage.htmlCachePage,
        },
      );

      expect(mockSearchResultCreate).toHaveBeenCalled();
      expect(mockSearchResultCreate).toHaveBeenCalledWith(mockPayload);
      expect(mockHtmlPageCacheCreate).toHaveBeenCalled();
      expect(mockHtmlPageCacheCreate).toHaveBeenCalledWith({
        html: mockSearchResultWithHtmlCachePage.htmlCachePage,
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
        fn: () =>
          reportService.saveHtmlPageCache(
            mockSearchResultWithHtmlCachePage.htmlCachePage,
          ),
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

      const result = await reportService.saveHtmlPageCache(
        mockSearchResultWithHtmlCachePage.htmlCachePage,
      );

      expect(mockHtmlPageCacheCreate).toHaveBeenCalled();
      expect(mockHtmlPageCacheCreate).toHaveBeenCalledWith({
        html: mockSearchResultWithHtmlCachePage.htmlCachePage,
      });
      expect(result).toEqual(1);
    });
  });

  describe('getKeywordScrappedResult', () => {
    it('should throw error if keyword not found', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue(null);

      await expectException({
        fn: () =>
          reportService.getKeywordScrappedResult(mockScrapeContext.keywordId),
        exceptionInstance: AppError,
        message: 'Keyword not found',
      });
    });

    it('should throw error if keyword status is not completed', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        ...mockKeyword,
        status: KeywordStatus.Pending,
      });

      await expectException({
        fn: () =>
          reportService.getKeywordScrappedResult(mockScrapeContext.keywordId),
        exceptionInstance: AppError,
        message: 'Can not get in-completed keyword',
      });
    });

    it('should throw error if search result not found', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        ...mockKeyword,
        status: KeywordStatus.Completed,
      });
      mockSearchResultFindOne.mockResolvedValue(null);

      await expectException({
        fn: () =>
          reportService.getKeywordScrappedResult(mockScrapeContext.keywordId),
        exceptionInstance: AppError,
        message: 'Can not found search result of keyword',
      });
    });

    it('should throw error if html page cache id not attached', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        ...mockKeyword,
        status: KeywordStatus.Completed,
      });
      mockSearchResultFindOne.mockResolvedValue({
        dataValues: {
          htmlCacheId: null,
        },
      });

      await expectException({
        fn: () =>
          reportService.getKeywordScrappedResult(mockScrapeContext.keywordId),
        exceptionInstance: AppError,
        message: 'No html page cache attached',
      });
    });

    it('should throw error if html page cache id not found', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        ...mockKeyword,
        status: KeywordStatus.Completed,
      });
      mockSearchResultFindOne.mockResolvedValue({
        dataValues: {
          htmlCacheId: 123,
        },
      });
      mockHtmlPageCacheFindByPk.mockResolvedValue(null);

      await expectException({
        fn: () =>
          reportService.getKeywordScrappedResult(mockScrapeContext.keywordId),
        exceptionInstance: AppError,
        message: 'Can not found html page cache of keyword',
      });
    });

    it('should return correct keyword scrapped result', async () => {
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        ...mockKeyword,
        status: KeywordStatus.Completed,
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
        mockScrapeContext.keywordId,
      );

      expect(keywordService.getByKeywordId).toHaveBeenCalledWith(
        mockScrapeContext.keywordId,
      );
      expect(mockSearchResultFindOne).toHaveBeenCalledWith({
        where: {
          keywordId: mockKeywordId,
        },
      });
      expect(mockHtmlPageCacheFindByPk).toHaveBeenCalledWith(123);
      expect(result).toMatchObject(mockSearchResultWithHtmlCachePage);
    });
  });
});
