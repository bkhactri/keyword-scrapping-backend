import { getIO } from '@src/config/socket';
import { logger } from '@src/config/logger';
import * as userConnection from '@src/services/user-connection.service';
import * as keywordService from '@src/services/keyword.service';

export const emitKeywordUpdate = async (userId: string, keywordId: number) => {
  const io = getIO();
  const connection = await userConnection.getByUserId(userId);

  if (!connection) {
    logger.warn({ userId }, `No active connection`);
    return;
  }

  const keyword = await keywordService.getByKeywordId(keywordId);

  if (!keyword) {
    logger.error({ keywordId }, 'Keyword with ID not found');
    return;
  }

  io.to(connection.socketId).emit('keyword-processed', keyword);
};
