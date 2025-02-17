import { Job } from 'bullmq';
import * as worker from '@src/workers/keyword.worker';
import * as keywordService from '@src/services/keyword.service';
import * as scrapeService from '@src/services/scrape.service';
import * as reportService from '@src/services/report.service';
import { KeywordProcessingPayload } from '@src/interfaces/keyword.interface';

jest.mock('bullmq');
jest.mock('ioredis');

jest.mock('@src/services/keyword.service', () => ({
  updateKeywordStatus: jest.fn(),
}));
jest.mock('@src/services/scrape.service', () => ({
  scrapeGoogle: jest.fn(),
}));
jest.mock('@src/services/report.service', () => ({
  saveGoogleScrapeResult: jest.fn(),
}));

interface MockJob<T> extends Job<T> {
  data: T;
}

describe('Keyword worker', () => {
  const mockJob: MockJob<KeywordProcessingPayload> = {
    data: {
      userId: 'mock-user-id',
      keyword: 'key1',
      keywordId: 1,
    },
  } as unknown as Job<KeywordProcessingPayload>;
  const mockScrapeResult = {
    totalAds: 6,
    totalLinks: 120,
    htmlCachePage: '<html></html>',
  };

  const mockUpdateKeywordStatus =
    keywordService.updateKeywordStatus as jest.Mock;
  const mockScrapeGoogle = scrapeService.scrapeGoogle as jest.Mock;
  const mockSaveGoogleScrapeResult =
    reportService.saveGoogleScrapeResult as jest.Mock;

  describe('processKeyword', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return correct result if successfully', async () => {
      mockUpdateKeywordStatus
        .mockResolvedValueOnce({ dataValues: { id: 1 } })
        .mockResolvedValueOnce({ dataValues: { id: 1 } });
      mockScrapeGoogle.mockResolvedValueOnce(mockScrapeResult);
      mockSaveGoogleScrapeResult.mockResolvedValueOnce({
        id: 1,
      });

      const result = await worker.processKeyword(mockJob);

      expect(mockUpdateKeywordStatus).toHaveBeenCalledTimes(2);
      expect(mockScrapeGoogle).toHaveBeenCalledTimes(1);
      expect(mockSaveGoogleScrapeResult).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({ result: 'Processed: key1' });
    });

    it('should not update keyword status failed when scrapping errors', async () => {
      mockUpdateKeywordStatus
        .mockResolvedValueOnce({ dataValues: { id: 1 } })
        .mockResolvedValueOnce({ dataValues: { id: 1 } });
      mockScrapeGoogle.mockRejectedValueOnce(new Error('Scrapping error'));

      await worker.processKeyword(mockJob);

      expect(mockScrapeGoogle).toHaveBeenCalledTimes(1);
      expect(mockUpdateKeywordStatus).toHaveBeenCalledTimes(2);
      expect(mockUpdateKeywordStatus).toHaveBeenCalledWith(1, 'in-progress');
      expect(mockUpdateKeywordStatus).toHaveBeenCalledWith(1, 'failed');
    });

    it('should not update keyword status failed when scrapping return null', async () => {
      mockUpdateKeywordStatus
        .mockResolvedValueOnce({ dataValues: { id: 1 } })
        .mockResolvedValueOnce({ dataValues: { id: 1 } });
      mockScrapeGoogle.mockResolvedValueOnce(null);

      await worker.processKeyword(mockJob);

      expect(mockScrapeGoogle).toHaveBeenCalledTimes(1);
      expect(mockUpdateKeywordStatus).toHaveBeenCalledTimes(2);
      expect(mockUpdateKeywordStatus).toHaveBeenCalledWith(1, 'in-progress');
      expect(mockUpdateKeywordStatus).toHaveBeenCalledWith(1, 'failed');
    });
  });
});
