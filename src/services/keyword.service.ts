import { Op, WhereOptions } from 'sequelize';
import { Keyword } from '@src/models';
import { KeywordStatus } from '@src/enums/keyword.enum';
import { KeywordDto } from '@src/dtos/keyword.dto';
import {
  KeywordAttributes,
  KeywordList,
} from '@src/interfaces/keyword.interface';
import { Filter, Pagination } from '@src/interfaces/common.interface';

export const createBulk = async (
  userId: string,
  keywords: string[],
): Promise<KeywordDto[]> => {
  const keywordsCreatePayload = keywords.map((keyword) => ({
    userId,
    keyword,
    status: KeywordStatus.Pending,
  }));

  const newKeywords = await Keyword.bulkCreate(keywordsCreatePayload);

  return newKeywords.map((keyword) => new KeywordDto(keyword.dataValues));
};

export const updateKeywordStatus = async (
  id: number,
  status: KeywordStatus,
): Promise<void> => {
  const keyword = await Keyword.findByPk(id);

  if (!keyword) {
    throw new Error('Update keyword status failed: keyword not found');
  }

  await Keyword.update({ status }, { where: { id } });
};

export const getByKeywordId = async (id: number): Promise<KeywordDto> => {
  const keyword = await Keyword.findByPk(id);

  if (!keyword) {
    throw new Error('Keyword not found');
  }

  return new KeywordDto(keyword.dataValues);
};

export const getKeywords = async (
  userId: string,
  pagination: Pagination,
  filter: Filter,
): Promise<KeywordList> => {
  const { page, pageSize } = pagination;
  const offset = page * pageSize;
  const limit = pageSize;

  const whereClause: WhereOptions<KeywordAttributes> = {
    userId,
  };

  if (filter?.search) {
    whereClause.keyword = { [Op.iLike]: `%${filter?.search}%` };
  }

  try {
    const { count, rows } = await Keyword.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order: [['updatedAt', 'DESC']],
    });

    return {
      total: count,
      keywords: rows.map((keyword) => new KeywordDto(keyword.dataValues)),
      page,
      pageSize,
    };
  } catch (error) {
    throw error;
  }
};
