import { getIO } from '@src/config/socket';
import { logger } from '@src/config/logger';
import * as userConnection from '@src/services/user-connection.service';
import * as keywordService from '@src/services/keyword.service';
import * as reportService from '@src/services/report.service';
import { KeywordDto } from '../dtos/keyword.dto';

export const emitKeywordUpdate = async (userId: string, keywordId: number) => {
  try {
    const io = getIO();
    const connection = await userConnection.getByUserId(userId);

    if (!connection) {
      logger.warn({ userId }, 'No active connection');
      return;
    }

    const keyword = await keywordService.getByKeywordId(keywordId);

    if (!keyword) {
      logger.error({ keywordId }, 'Keyword with ID not found');
      return;
    }

    const searchResult = await reportService.getSearchResultByKeywordId(
      keyword.id,
    );

    if (!searchResult) {
      logger.error({ keyword }, 'Search result not found');
      return;
    }

    const keywordData = new KeywordDto({
      ...keyword,
      searchResult,
    });

    io.to(connection.socketId).emit('keyword-processed', keywordData);
  } catch (error) {
    logger.error(
      { userId, keywordId, error },
      'Emit scrapped keyword to user failed',
    );
  }
};
