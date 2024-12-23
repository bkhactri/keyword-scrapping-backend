import { parseHtml } from '@src/utils/parser.util';
import { ScrapeResult } from '@src/interfaces/scrape.interface';
import puppeteer, { Browser, Page } from 'puppeteer';

describe.skip('Parser util', () => {
  describe('parseHtml', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
      browser = await puppeteer.launch();
      page = await browser.newPage();
    });

    afterAll(async () => {
      await browser.close();
    });

    it('should parse HTML and extract data correctly includes top ads, remain ads and total links', async () => {
      // Arrange
      const mockHtmlSearch = `<html><head></head>
            <body>
              <div class="KoyyGc">Top Ad</div>
              <div class="uEierd">Remain Ad</div>
              <a>Link 1</a>
              <a>Link 2</a>
              <a>Link 3</a>
              <a>Link 4</a>
            </body></html>`;

      await page.setContent(mockHtmlSearch);

      // Act
      const result: ScrapeResult = await parseHtml(page);

      // Assert
      expect(result.totalAds).toBe(2);
      expect(result.totalLinks).toBe(4);
      expect(result.htmlCachePage).toEqual(mockHtmlSearch);
    });

    it('should parse HTML and extract data correctly includes top ads and remain ads without links', async () => {
      // Arrange
      const mockHtmlSearch = `<html><head></head>
            <body>
              <div class="KoyyGc">Top Ad</div>
              <div class="uEierd">Remain Ad</div>
            </body></html>`;

      await page.setContent(mockHtmlSearch);

      // Act
      const result = await parseHtml(page);

      // Assert
      expect(result.totalAds).toBe(2);
      expect(result.totalLinks).toBe(0);
      expect(result.htmlCachePage).toEqual(mockHtmlSearch);
    });

    it('should parse HTML and extract data correctly includes links without ads', async () => {
      // Arrange
      const mockHtmlSearch = `<html><head></head>
            <body>
              <a>Link 1</a>
              <a>Link 2</a>
              <a>Link 3</a>
              <a>Link 4</a>
            </body></html>`;

      await page.setContent(mockHtmlSearch);

      // Act
      const result = await parseHtml(page);

      // Assert
      expect(result.totalAds).toBe(0);
      expect(result.totalLinks).toBe(4);
      expect(result.htmlCachePage).toEqual(mockHtmlSearch);
    });

    it('should parse HTML and extract data correctly without ads and links', async () => {
      // Arrange
      const mockHtmlSearch = `<html><head></head>
            <body>
            </body></html>`;

      await page.setContent(mockHtmlSearch);

      // Act
      const result = await parseHtml(page);

      // Assert
      expect(result.totalAds).toBe(0);
      expect(result.totalLinks).toBe(0);
      expect(result.htmlCachePage).toEqual(mockHtmlSearch);
    });
  });
});
