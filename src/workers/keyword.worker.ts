import { Worker, Job } from 'bullmq';
import { QUEUE_NAME, redisConnection } from '@src/config/queue';
import { logger } from '@src/config/logger';
import { KeywordStatus } from '@src/enums/keyword.enum';
import * as keywordService from '@src/services/keyword.service';
import * as scrapeService from '@src/services/scrape.service';
import * as reportService from '@src/services/report.service';
import * as pollingService from '@src/services/polling.service';
import { ScrapeResult } from '@src/interfaces/scrape.interface';
import { KeywordProcessingPayload } from '@src/interfaces/keyword.interface';

export const processKeyword = async (
  job: Job<KeywordProcessingPayload>,
): Promise<{ result: string } | void> => {
  const { userId, keyword, keywordId } = job.data;

  try {
    logger.info({ keyword }, 'Processing keyword');

    // Mark keyword as processing
    await keywordService.updateKeywordStatus(
      keywordId,
      KeywordStatus.InProgress,
    );

    const result = await scrapeService.scrapeGoogle(keyword, 0);

    if (!result) {
      logger.error({ keyword }, 'Error scrapping keyword');
      throw new Error('Error scrapping keyword');
    }

    const savedScrapeResult = await reportService.saveGoogleScrapeResult(
      job.data,
      result as ScrapeResult,
    );

    if (savedScrapeResult) {
      // Mark keyword as completed
      await keywordService.updateKeywordStatus(
        keywordId,
        KeywordStatus.Completed,
      );

      await pollingService.emitKeywordUpdate(userId, keywordId);
    }

    logger.info({ keyword }, 'Finished processing keyword');
    return { result: `Processed: ${keyword}` };
  } catch (error) {
    logger.error({ keyword, error }, `Error processing keyword`);

    // Mark keyword as failed
    await keywordService.updateKeywordStatus(keywordId, KeywordStatus.Failed);
  }
};

export const keywordWorker = new Worker(QUEUE_NAME, processKeyword, {
  connection: redisConnection,
  concurrency: 10,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 500 },
  limiter: {
    max: 100,
    duration: 4000 * 100,
  },
});
