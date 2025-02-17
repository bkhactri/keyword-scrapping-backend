import KeywordModel from '@src/models/keyword.model';
import sequelize from '@src/config/database';
import * as keywordService from '@src/services/keyword.service';
import { expectException } from '@tests/helpers/expect-exception.helper';
import { KeywordStatus } from '@src/enums/keyword.enum';
import { mockDefaultPagination, mockFilter } from '@tests/_mocks_/context-mock';
import { mockUserId } from '@tests/_mocks_/user-mock';
import {
  mockKeywordRawList,
  mockKeywordId,
  mockKeywordDto,
  mockKeywordAttributes,
  mockSearchResultAttributes,
} from '@tests/_mocks_/keyword-mock';

jest.mock('@src/models/keyword.model', () => {
  const mockKeywordModel = {
    hasOne: jest.fn(),
    bulkCreate: jest.fn(),
    update: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  };
  return jest.fn(() => mockKeywordModel);
});

jest.mock('@src/models/search-result.model', () => {
  const mockSearchResultModel = {
    belongsTo: jest.fn(),
  };
  return jest.fn(() => mockSearchResultModel);
});

describe('Keyword service', () => {
  const mockFindByPk = KeywordModel(sequelize).findByPk as jest.Mock;

  describe('createBulk', () => {
    const mockBulkCreate = KeywordModel(sequelize).bulkCreate as jest.Mock;

    it('should bulk create keywords and return data mapped to dto', async () => {
      // Arrange
      mockBulkCreate.mockResolvedValue(
        mockKeywordRawList.map((keyword, index) => ({
          dataValues: {
            id: index + 1,
            userId: mockUserId,
            status: KeywordStatus.Pending,
            keyword,
          },
        })),
      );

      // Arrange
      const result = await keywordService.createBulk(
        mockUserId,
        mockKeywordRawList,
      );

      // Assert
      expect(mockBulkCreate).toHaveBeenCalledTimes(1);
      expect(mockBulkCreate).toHaveBeenCalledWith(
        mockKeywordRawList.map((keyword) => ({
          userId: mockUserId,
          status: KeywordStatus.Pending,
          keyword,
        })),
      );
      expect(result).toHaveLength(mockKeywordRawList.length);

      mockKeywordRawList.forEach((expectedKeyword, index) => {
        expect(result[index]).toMatchObject({
          id: index + 1,
          userId: mockUserId,
          status: KeywordStatus.Pending,
          keyword: expectedKeyword,
        });
      });
    });
  });

  describe('updateKeywordStatus', () => {
    const mockUpdate = KeywordModel(sequelize).update as jest.Mock;

    it('should throw error if keyword was not found', async () => {
      // Arrange
      mockFindByPk.mockResolvedValue(null);

      // Act + Assert
      await expectException({
        fn: () =>
          keywordService.updateKeywordStatus(
            mockKeywordId,
            KeywordStatus.Pending,
          ),
        exceptionInstance: Error,
        message: 'Update keyword status failed: keyword not found',
      });
    });

    it('should update keyword with correct status', async () => {
      // Arrange
      mockFindByPk.mockResolvedValue({ dataValues: mockKeywordDto });
      mockUpdate.mockResolvedValue(1);

      // Act
      await keywordService.updateKeywordStatus(
        mockKeywordId,
        KeywordStatus.Pending,
      );

      // Assert
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith(
        { status: KeywordStatus.Pending },
        { where: { id: mockKeywordId } },
      );
    });
  });

  describe('getKeywordById', () => {
    it('should return correct keyword', async () => {
      // Arrange
      mockFindByPk.mockResolvedValue({
        dataValues: mockKeywordDto,
      });

      // Act
      const result = await keywordService.getByKeywordId(mockKeywordId);

      // Assert
      expect(mockFindByPk).toHaveBeenCalled();
      expect(mockFindByPk).toHaveBeenCalledWith(mockKeywordId);
      expect(result).toMatchObject(mockKeywordDto);
    });

    it('should throw error if get return empty result', async () => {
      // Arrange
      mockFindByPk.mockResolvedValue(null);

      // Act + Assert
      await expectException({
        fn: () => keywordService.getByKeywordId(mockKeywordId),
        exceptionInstance: Error,
        message: 'Keyword not found',
      });
    });
  });

  describe('getKeywords', () => {
    const mockFindAndCountAll = KeywordModel(sequelize)
      .findAndCountAll as jest.Mock;

    it('should return correct data includes search result base on pagination and filter', async () => {
      // Arrange
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: [
          {
            dataValues: {
              ...mockKeywordAttributes,
              searchResult: {
                dataValues: mockSearchResultAttributes,
              },
            },
          },
        ],
      });

      // Act
      const result = await keywordService.getKeywords(
        mockUserId,
        mockDefaultPagination,
        mockFilter,
      );

      // Assert
      expect(result).toMatchObject({
        total: 1,
        keywords: [mockKeywordDto],
        ...mockDefaultPagination,
      });
    });

    it('should throw error if something went wrong', async () => {
      // Arrange
      const mockError = new Error('Database error');
      mockFindAndCountAll.mockRejectedValue(mockError);

      // Act + Assert
      await expectException({
        fn: () =>
          keywordService.getKeywords(
            mockUserId,
            mockDefaultPagination,
            mockFilter,
          ),
        exceptionInstance: Error,
        message: 'Database error',
      });
    });
  });
});
