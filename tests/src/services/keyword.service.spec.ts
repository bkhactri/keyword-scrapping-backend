import KeywordModel from '@src/models/keyword.model';
import sequelize from '@src/config/database';
import * as keywordService from '@src/services/keyword.service';
import { expectException } from '@tests/helpers/expect-exception.helper';
import { KeywordStatus } from '@src/enums/keyword.enum';

jest.mock('@src/models/keyword.model', () => {
  const mockKeywordModel = {
    bulkCreate: jest.fn(),
    update: jest.fn(),
    findByPk: jest.fn(),
  };
  return jest.fn(() => mockKeywordModel);
});

describe('Keyword service', () => {
  const mockBulkCreate = KeywordModel(sequelize).bulkCreate as jest.Mock;
  const mockUpdate = KeywordModel(sequelize).update as jest.Mock;
  const mockFindByPk = KeywordModel(sequelize).findByPk as jest.Mock;
  const mockUserId = 'mock-user-id';
  const mockKeywordId = 1;
  const mockKeywords = ['key1', 'key2', 'key3'];

  describe('createBulk', () => {
    it('should bulk create keywords and return data mapped to dto', async () => {
      mockBulkCreate.mockResolvedValue([
        {
          dataValues: {
            id: 1,
            userId: 'mock-user-id',
            status: 'pending',
            keyword: 'key1',
          },
        },
        {
          dataValues: {
            id: 2,
            userId: 'mock-user-id',
            status: 'pending',
            keyword: 'key2',
          },
        },
        {
          dataValues: {
            id: 3,
            userId: 'mock-user-id',
            status: 'pending',
            keyword: 'key3',
          },
        },
      ]);

      const result = await keywordService.createBulk(mockUserId, mockKeywords);

      expect(mockBulkCreate).toHaveBeenCalled();
      expect(mockBulkCreate).toHaveBeenCalledWith([
        {
          userId: 'mock-user-id',
          status: 'pending',
          keyword: 'key1',
        },
        {
          userId: 'mock-user-id',
          status: 'pending',
          keyword: 'key2',
        },
        {
          userId: 'mock-user-id',
          status: 'pending',
          keyword: 'key3',
        },
      ]);
      expect(result.length).toBe(3);
      expect(result[0]).toMatchObject({
        id: 1,
        userId: 'mock-user-id',
        status: 'pending',
        keyword: 'key1',
      });
    });
  });

  describe('updateKeywordStatus', () => {
    it('should throw error if keyword was not found', async () => {
      mockFindByPk.mockResolvedValue(null);

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
      mockFindByPk.mockResolvedValue({ dataValues: { id: 1 } });
      mockUpdate.mockResolvedValue({});

      await keywordService.updateKeywordStatus(
        mockKeywordId,
        KeywordStatus.Pending,
      );

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith(
        { status: KeywordStatus.Pending },
        { where: { id: mockKeywordId } },
      );
    });
  });

  describe('getKeywordById', () => {
    it('should return correct keyword', async () => {
      mockFindByPk.mockResolvedValue({
        dataValues: {
          id: mockKeywordId,
        },
      });

      const result = await keywordService.getByKeywordId(mockKeywordId);

      expect(mockFindByPk).toHaveBeenCalled();
      expect(mockFindByPk).toHaveBeenCalledWith(mockKeywordId);
      expect(result).toMatchObject({ id: mockKeywordId });
    });

    it('should throw error if get return empty result', async () => {
      mockFindByPk.mockResolvedValue(null);

      await expectException({
        fn: () => keywordService.getByKeywordId(mockKeywordId),
        exceptionInstance: Error,
        message: 'Keyword not found',
      });
    });
  });
});
