import { Job } from 'bullmq';
import * as worker from '@src/workers/keyword.worker';
import * as keywordService from '@src/services/keyword.service';
import * as scrapeService from '@src/services/scrape.service';
import * as reportService from '@src/services/report.service';
import * as pollingService from '@src/services/polling.service';
import { KeywordProcessingPayload } from '@src/interfaces/keyword.interface';
import {
  mockKeywordId,
  mockKeywordProcessingPayload,
  mockKeywordText,
  mockScrapeResult,
  mockSearchResultAttributes,
} from '@tests/_mocks_/keyword-mock';

interface MockJob<T> extends Job<T> {
  data: T;
}

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
jest.mock('@src/services/polling.service', () => ({
  emitKeywordUpdate: jest.fn(),
}));

describe('Keyword worker', () => {
  const mockJob: MockJob<KeywordProcessingPayload> = {
    data: mockKeywordProcessingPayload,
  } as unknown as Job<KeywordProcessingPayload>;

  const mockUpdateKeywordStatus =
    keywordService.updateKeywordStatus as jest.Mock;
  const mockScrapeGoogle = scrapeService.scrapeGoogle as jest.Mock;
  const mockSaveGoogleScrapeResult =
    reportService.saveGoogleScrapeResult as jest.Mock;
  const mockEmitKeywordUpdate = pollingService.emitKeywordUpdate as jest.Mock;

  describe('processKeyword', () => {
    beforeEach(() => {
      mockUpdateKeywordStatus.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return correct result if successfully', async () => {
      // Arrange
      mockScrapeGoogle.mockResolvedValueOnce(mockScrapeResult);
      mockSaveGoogleScrapeResult.mockResolvedValueOnce(
        mockSearchResultAttributes,
      );
      mockEmitKeywordUpdate.mockResolvedValueOnce(true);

      // Act
      const result = await worker.processKeyword(mockJob);

      // Assert
      expect(mockUpdateKeywordStatus).toHaveBeenCalledTimes(2);
      expect(mockScrapeGoogle).toHaveBeenCalledTimes(1);
      expect(mockSaveGoogleScrapeResult).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({ result: `Processed: ${mockKeywordText}` });
    });

    it('should not update keyword status failed when scrapping errors', async () => {
      // Arrange
      const mockError = new Error('Scrapping error');
      mockScrapeGoogle.mockRejectedValueOnce(mockError);

      // Act
      await worker.processKeyword(mockJob);

      // Assert
      expect(mockScrapeGoogle).toHaveBeenCalledTimes(1);
      expect(mockUpdateKeywordStatus).toHaveBeenCalledTimes(2);
      expect(mockUpdateKeywordStatus).toHaveBeenCalledWith(
        mockKeywordId,
        'in-progress',
      );
      expect(mockUpdateKeywordStatus).toHaveBeenCalledWith(
        mockKeywordId,
        'failed',
      );
    });

    it('should not update keyword status failed when scrapping return null', async () => {
      // Arrange
      mockScrapeGoogle.mockResolvedValueOnce(null);

      // Act
      await worker.processKeyword(mockJob);

      // Assert
      expect(mockScrapeGoogle).toHaveBeenCalledTimes(1);
      expect(mockUpdateKeywordStatus).toHaveBeenCalledTimes(2);
      expect(mockUpdateKeywordStatus).toHaveBeenCalledWith(
        mockKeywordId,
        'in-progress',
      );
      expect(mockUpdateKeywordStatus).toHaveBeenCalledWith(
        mockKeywordId,
        'failed',
      );
    });
  });
});
