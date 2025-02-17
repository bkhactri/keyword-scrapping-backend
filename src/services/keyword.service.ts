import { Keyword } from '@src/models';
import { KeywordStatus } from '@src/enums/keyword.enum';
import { KeywordDto } from '@src/dtos/keyword.dto';

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
