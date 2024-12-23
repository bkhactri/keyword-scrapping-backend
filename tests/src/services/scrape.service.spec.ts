import puppeteer, { Page } from 'puppeteer';
import * as scrapeService from '@src/services/scrape.service';

jest.mock('puppeteer');

describe('Scrape service', () => {
  describe('getRandomUserAgent', () => {
    it('should return a random user agent string', () => {
      // Arrange -> skip due to unnecessary

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

  describe('parseHtml', () => {
    it('should parse HTML and extract data correctly includes top ads, remain ads and total links', async () => {
      // Arrange
      const mockHtmlSearch = `
          <html>
              <div class="KoyyGc">Top Ad</div>
              <div class="uEierd">Remain Ad</div>
              <a>Link 1</a>
              <a>Link 2</a>
              <a>Link 3</a>
              <a>Link 4</a>
          </html>
      `;
      const mockPage = {
        evaluate: jest
          .fn()
          .mockResolvedValueOnce(1) // -> mock numberOfTopAds
          .mockResolvedValueOnce(1) // -> mock numberOfRemainAds
          .mockResolvedValueOnce(4), // -> mock totalLinks
        content: jest.fn().mockResolvedValue(mockHtmlSearch),
      };

      // Act
      const result = await scrapeService.parseHtml(mockPage as unknown as Page);

      // Assert
      expect(result).toEqual({
        totalAds: 2,
        totalLinks: 4,
        htmlCachePage: mockHtmlSearch,
      });
    });

    it('should parse HTML and extract data correctly includes top ads and remain ads without links', async () => {
      // Arrange
      const mockHtmlSearch = `
          <html>
              <div class="KoyyGc">Top Ad</div>
              <div class="uEierd">Remain Ad</div>
          </html>
      `;
      const mockPage = {
        evaluate: jest
          .fn()
          .mockResolvedValueOnce(1) // -> mock numberOfTopAds
          .mockResolvedValueOnce(1) // -> mock numberOfRemainAds
          .mockResolvedValueOnce(0), // -> mock totalLinks
        content: jest.fn().mockResolvedValue(mockHtmlSearch),
      };

      // Act
      const result = await scrapeService.parseHtml(mockPage as unknown as Page);

      // Assert
      expect(result).toEqual({
        totalAds: 2,
        totalLinks: 0,
        htmlCachePage: mockHtmlSearch,
      });
    });

    it('should parse HTML and extract data correctly includes links without ads', async () => {
      // Arrange
      const mockHtmlSearch = `
          <html>
              <a>Link 1</a>
              <a>Link 2</a>
              <a>Link 3</a>
              <a>Link 4</a>
          </html>
      `;
      const mockPage = {
        evaluate: jest
          .fn()
          .mockResolvedValueOnce(0) // -> mock numberOfTopAds
          .mockResolvedValueOnce(0) // -> mock numberOfRemainAds
          .mockResolvedValueOnce(4), // -> mock totalLinks
        content: jest.fn().mockResolvedValue(mockHtmlSearch),
      };

      // Act
      const result = await scrapeService.parseHtml(mockPage as unknown as Page);

      // Assert
      expect(result).toEqual({
        totalAds: 0,
        totalLinks: 4,
        htmlCachePage: mockHtmlSearch,
      });
    });

    it('should parse HTML and extract data correctly without ads and links', async () => {
      // Arrange
      const mockHtmlSearch = `
          <html>
              <p>Mock html</p>
          </html>
      `;
      const mockPage = {
        evaluate: jest
          .fn()
          .mockResolvedValueOnce(0) // -> mock numberOfTopAds
          .mockResolvedValueOnce(0) // -> mock numberOfRemainAds
          .mockResolvedValueOnce(0), // -> mock totalLinks
        content: jest.fn().mockResolvedValue(mockHtmlSearch),
      };

      // Act
      const result = await scrapeService.parseHtml(mockPage as unknown as Page);

      // Assert
      expect(result).toEqual({
        totalAds: 0,
        totalLinks: 0,
        htmlCachePage: mockHtmlSearch,
      });
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

    it('should successfully scrape data', async () => {
      // Arrange
      const mockHtmlSearch = `
          <html>
              <div class="KoyyGc">Top Ad</div>
              <div class="uEierd">Remain Ad</div>
              <a>Link 1</a>
              <a>Link 2</a>
              <a>Link 3</a>s
              <a>Link 4</a>
          </html>
      `;
      mockEvaluate
        .mockResolvedValueOnce(1) // -> mock numberOfTopAds
        .mockResolvedValueOnce(1) // -> mock numberOfRemainAds
        .mockResolvedValueOnce(4), // -> mock totalLinks
        mockContent.mockResolvedValue(mockHtmlSearch);

      // Act
      const result = await scrapeService.scrapeGoogle(searchKeyword, 0);
      const url = scrapeService.buildQueryUrl(searchKeyword, 0);

      // Assert
      expect(result).toEqual({
        totalAds: 2,
        totalLinks: 4,
        htmlCachePage: mockHtmlSearch,
      });
      expect(puppeteer.launch).toHaveBeenCalled();
      expect(mockNewPage).toHaveBeenCalled();
      expect(mockSetUserAgent).toHaveBeenCalled();
      expect(mockGoto).toHaveBeenCalledWith(url, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      expect(mockWaitForSelector).toHaveBeenCalledWith('body');
      expect(mockClose).toHaveBeenCalledTimes(1);
    }, 3000);

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
