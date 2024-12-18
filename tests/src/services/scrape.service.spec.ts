import puppeteer from 'puppeteer';
import * as scrapeService from '@src/services/scrape.service';

jest.mock('puppeteer');

describe('Scrape service', () => {
  describe('scrapeGoogle', () => {
    let mockNewPage: jest.Mock;
    let mockSetUserAgent: jest.Mock;
    let mockOn: jest.Mock;
    let mockGoto: jest.Mock;
    let mockWaitForSelector: jest.Mock;
    let mockEvaluate: jest.Mock;
    let mockContent: jest.Mock;
    let mockClose: jest.Mock;
    let mockSetViewport: jest.Mock;

    beforeEach(() => {
      mockNewPage = jest.fn();
      mockSetUserAgent = jest.fn();
      mockOn = jest.fn();
      mockGoto = jest.fn();
      mockWaitForSelector = jest.fn();
      mockEvaluate = jest.fn();
      mockContent = jest.fn();
      mockClose = jest.fn();
      mockSetViewport = jest.fn();

      (puppeteer.launch as jest.Mock).mockResolvedValue({
        newPage: mockNewPage.mockResolvedValue({
          setUserAgent: mockSetUserAgent,
          setViewport: mockSetViewport,
          on: mockOn,
          goto: mockGoto,
          waitForSelector: mockWaitForSelector,
          evaluate: mockEvaluate,
          content: mockContent,
          close: mockClose,
        }),
        close: mockClose,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully scrape data', async () => {
      mockEvaluate
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(1);
      mockContent.mockResolvedValue('<html></html>');

      const result = await scrapeService.scrapeGoogle('test', 0);

      expect(result).toEqual({
        totalAds: 4,
        totalLinks: 10,
        htmlCachePage: '<html></html>',
      });
      expect(puppeteer.launch).toHaveBeenCalled();
      expect(mockNewPage).toHaveBeenCalled();
      expect(mockSetUserAgent).toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledWith(
        'https://www.google.com/search?q=test&start=0',
        { waitUntil: 'domcontentloaded', timeout: 15000 },
      );
      expect(mockWaitForSelector).toHaveBeenCalledWith('body');
      expect(mockClose).toHaveBeenCalledTimes(1);
    }, 3000);

    it('should handle navigation errors', async () => {
      const error = new Error('Navigation Error');
      mockGoto.mockRejectedValue(error);

      const result = await scrapeService.scrapeGoogle('test', 0);

      expect(result).toBeNull();
      expect(mockClose).toHaveBeenCalledTimes(1);
    }, 3000);

    it('should handle page errors', async () => {
      const error = new Error('Page Error');
      mockOn.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(error);
        }
      });

      await scrapeService.scrapeGoogle('test', 0);
      expect(mockClose).toHaveBeenCalledTimes(2);
    }, 3000);
  });
});
