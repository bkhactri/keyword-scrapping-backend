import { KeywordProcessingPayload } from '@src/interfaces/keyword.interface';
import { keywordQueue } from '@src/config/queue';

export const enqueueKeywordProcessing = (payload: KeywordProcessingPayload) => {
  keywordQueue.add('process-keyword', payload);
};
