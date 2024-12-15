import SearchResultModel from '@src/models/search-result.model';
import HtmlPageCacheModel from '@src/models/html-page-cache.model';
import sequelize from '@src/config/database';
import { expectException } from '@tests/helpers/expect-exception.helper';
import * as reportService from '@src/services/report.service';

jest.mock('@src/models/search-result.model', () => {
  const mockSearchResultModel = {
    create: jest.fn(),
  };
  return jest.fn(() => mockSearchResultModel);
});
jest.mock('@src/models/html-page-cache.model', () => {
  const mockHtmlPageCacheModel = {
    create: jest.fn(),
  };
  return jest.fn(() => mockHtmlPageCacheModel);
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
  const mockHtmlPageCacheCreate = HtmlPageCacheModel(sequelize)
    .create as jest.Mock;

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
});
