import SearchResultModel from '@src/models/search-result.model';
import HtmlPageCacheModel from '@src/models/html-page-cache.model';
import sequelize from '@src/config/database';
import { expectException } from '@tests/helpers/expect-exception.helper';
import * as reportService from '@src/services/report.service';
import * as keywordService from '@src/services/keyword.service';
import { AppError } from '@src/utils/error.util';
import { KeywordStatus } from '@src/enums/keyword.enum';
import {
  mockHtmlPageCache,
  mockHtmlPageCacheAttributes,
  mockKeywordDto,
  mockKeywordId,
  mockKeywordProcessingPayload,
  mockReportKeywordDto,
  mockScrapeResult,
  mockSearchResultAttributes,
  mockSearchResultCreationPayload,
} from '@tests/_mocks_/keyword-mock';

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

describe('Report service', () => {
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
      // Arrange
      mockHtmlPageCacheCreate.mockResolvedValue({
        dataValues: mockHtmlPageCacheAttributes,
      });
      mockSearchResultCreate.mockResolvedValue({
        dataValues: mockSearchResultAttributes,
      });

      // Act
      const result = await reportService.saveGoogleScrapeResult(
        mockKeywordProcessingPayload,
        mockScrapeResult,
      );

      // Assert
      expect(mockSearchResultCreate).toHaveBeenCalled();
      expect(mockSearchResultCreate).toHaveBeenCalledWith({
        keywordId: mockKeywordProcessingPayload.keywordId,
        htmlCacheId: mockHtmlPageCacheAttributes.id,
        totalAds: mockScrapeResult.totalAds,
        totalLinks: mockScrapeResult.totalLinks,
      });
      expect(mockHtmlPageCacheCreate).toHaveBeenCalled();
      expect(mockHtmlPageCacheCreate).toHaveBeenCalledWith({
        html: mockScrapeResult.htmlCachePage,
      });
      expect(result).toMatchObject(mockSearchResultAttributes);
    });
  });

  describe('saveSearchResultByKeyword', () => {
    it('should throw error if search result created fail', async () => {
      // Arrange
      const mockError = new Error('Database error');
      mockSearchResultCreate.mockRejectedValue(mockError);

      // Act + Assert
      await expectException({
        fn: () =>
          reportService.saveSearchResultByKeyword(
            mockSearchResultCreationPayload,
          ),
        exceptionInstance: Error,
        message: 'Database error',
      });
    });

    it('should return correct data after successfully created', async () => {
      // Arrange
      mockSearchResultCreate.mockResolvedValue({
        dataValues: mockSearchResultAttributes,
      });

      // Act
      const result = await reportService.saveSearchResultByKeyword(
        mockSearchResultCreationPayload,
      );

      // Assert
      expect(mockSearchResultCreate).toHaveBeenCalled();
      expect(mockSearchResultCreate).toHaveBeenCalledWith(
        mockSearchResultCreationPayload,
      );
      expect(result).toMatchObject(mockSearchResultAttributes);
    });
  });

  describe('saveHtmlPageCache', () => {
    it('should throw error if html page cache created fail', async () => {
      // Arrange
      const mockError = new Error('Database error');
      mockHtmlPageCacheCreate.mockRejectedValue(mockError);

      // Act + Assert
      await expectException({
        fn: () =>
          reportService.saveHtmlPageCache(mockHtmlPageCacheAttributes.html),
        exceptionInstance: Error,
        message: 'Database error',
      });
    });

    it('should return correct data after successfully created', async () => {
      // Arrange
      mockHtmlPageCacheCreate.mockResolvedValue({
        dataValues: mockHtmlPageCacheAttributes,
      });

      // Act
      const result = await reportService.saveHtmlPageCache(mockHtmlPageCache);

      // Assert
      expect(mockHtmlPageCacheCreate).toHaveBeenCalled();
      expect(mockHtmlPageCacheCreate).toHaveBeenCalledWith({
        html: mockHtmlPageCache,
      });
      expect(result).toEqual(1);
    });
  });

  describe('getKeywordScrappedResult', () => {
    it('should throw error if keyword not found', async () => {
      // Arrange
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue(null);

      // Act + Assert
      await expectException({
        fn: () => reportService.getKeywordScrappedResult(mockKeywordId),
        exceptionInstance: AppError,
        message: 'Keyword not found',
      });
    });

    it('should throw error if keyword status is not completed', async () => {
      // Arrange
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        ...mockKeywordDto,
        status: KeywordStatus.Pending,
      });

      // Act + Assert
      await expectException({
        fn: () => reportService.getKeywordScrappedResult(mockKeywordId),
        exceptionInstance: AppError,
        message: 'Can not get in-completed keyword',
      });
    });

    it('should throw error if html page cache id not attached', async () => {
      // Arrange
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        ...mockKeywordDto,
        status: KeywordStatus.Completed,
      });
      mockSearchResultFindOne.mockResolvedValue({
        dataValues: {
          htmlCacheId: null,
        },
      });

      // Act + Assert
      await expectException({
        fn: () => reportService.getKeywordScrappedResult(mockKeywordId),
        exceptionInstance: AppError,
        message: 'No html page cache attached',
      });
    });

    it('should return correct keyword scrapped result', async () => {
      // Arrange
      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue({
        ...mockKeywordDto,
        status: KeywordStatus.Completed,
      });
      mockSearchResultFindOne.mockResolvedValue({
        dataValues: mockSearchResultAttributes,
      });
      mockHtmlPageCacheFindByPk.mockResolvedValue({
        dataValues: mockHtmlPageCacheAttributes,
      });

      // Act
      const result =
        await reportService.getKeywordScrappedResult(mockKeywordId);

      const sanitizeHtml = reportService.sanitizeHtml(
        mockHtmlPageCacheAttributes.html,
      );

      // Assert
      expect(keywordService.getByKeywordId).toHaveBeenCalledWith(
        mockKeywordProcessingPayload.keywordId,
      );
      expect(mockSearchResultFindOne).toHaveBeenCalledWith({
        where: {
          keywordId: mockKeywordId,
        },
      });
      expect(mockHtmlPageCacheFindByPk).toHaveBeenCalledWith(
        mockSearchResultAttributes.htmlCacheId,
      );
      expect(result).toMatchObject({
        ...mockReportKeywordDto,
        htmlCachePage: sanitizeHtml,
      });
    });
  });

  describe('getSearchResultByKeywordId', () => {
    it('should throw error if search result not found', async () => {
      // Arrange
      mockSearchResultFindOne.mockResolvedValue(null);

      // Act + Assert
      await expectException({
        fn: () => reportService.getSearchResultByKeywordId(mockKeywordId),
        exceptionInstance: AppError,
        message: 'Can not find search result of keyword',
      });
    });

    it('should return correct search result data', async () => {
      // Arrange
      mockSearchResultFindOne.mockResolvedValue({
        dataValues: mockSearchResultAttributes,
      });

      // Act
      const result =
        await reportService.getSearchResultByKeywordId(mockKeywordId);

      // Assert
      expect(result).toMatchObject(mockSearchResultAttributes);
    });
  });

  describe('getHtmlPageCacheById', () => {
    it('should throw error if html page cache id not found', async () => {
      // Arrange
      mockHtmlPageCacheFindByPk.mockResolvedValue(null);

      // Act + Assert
      await expectException({
        fn: () => reportService.getHtmlPageCacheById(mockKeywordId),
        exceptionInstance: AppError,
        message: 'Can not found html page cache of keyword',
      });
    });

    it('should return correct html page cache data', async () => {
      // Arrange
      mockHtmlPageCacheFindByPk.mockResolvedValue({
        dataValues: mockHtmlPageCacheAttributes,
      });

      // Act
      const result = await reportService.getHtmlPageCacheById(
        mockHtmlPageCacheAttributes.id,
      );

      const sanitizeHtml = reportService.sanitizeHtml(
        mockHtmlPageCacheAttributes.html,
      );

      // Assert
      expect(result).toEqual(sanitizeHtml);
    });
  });
});
