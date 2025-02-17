import puppeteer from 'puppeteer';
import * as scrapeService from '@src/services/scrape.service';

jest.mock('puppeteer');

describe('Scrape service', () => {
  describe('getRandomUserAgent', () => {
    it('should return a random user agent string', () => {
      // Act
      const userAgent = scrapeService.getRandomUserAgent();

      // Assert
      expect(typeof userAgent).toBe('string');
    });
  });

  describe('buildQueryUrl', () => {
    it('should build URL with search and pageIndex', () => {
      // Arrange
      const searchKeyword = 'mock-search';
      const pageIndex = 0;

      // Act
      const url = scrapeService.buildQueryUrl(searchKeyword, pageIndex);

      // Assert
      expect(url).toBe('https://www.google.com/search?q=mock-search&start=0');
    });

    it('should build raw URL without any query param', () => {
      // Arrange
      const searchKeyword = '';
      const pageIndex = 2;

      // Act
      const url = scrapeService.buildQueryUrl(searchKeyword, pageIndex);

      // Assert
      expect(url).toBe('https://www.google.com/search?');
    });
  });

  describe('scrapeGoogle', () => {
    const searchKeyword = 'mock-search';
    const mockNewPage = jest.fn();
    const mockSetUserAgent = jest.fn();
    const mockOn = jest.fn();
    const mockGoto = jest.fn();
    const mockWaitForSelector = jest.fn();
    const mockEvaluate = jest.fn();
    const mockContent = jest.fn();
    const mockClose = jest.fn();
    const mockSetViewport = jest.fn();

    beforeEach(() => {
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

    it('should handle navigation errors', async () => {
      // Arrange
      const error = new Error('Navigation Error');
      mockGoto.mockRejectedValue(error);

      // Act
      const result = await scrapeService.scrapeGoogle(searchKeyword, 0);

      // Assert
      expect(result).toBeNull();
      expect(mockClose).toHaveBeenCalledTimes(1);
    }, 3000);

    it('should handle page errors', async () => {
      // Arrange
      const error = new Error('Page Error');
      mockOn.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(error);
        }
      });

      // Act
      await scrapeService.scrapeGoogle(searchKeyword, 0);

      // Assert
      expect(mockClose).toHaveBeenCalledTimes(2);
    }, 3000);
  });
});
