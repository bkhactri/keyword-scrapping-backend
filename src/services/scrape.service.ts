import puppeteer from 'puppeteer';
import { logger } from '@src/config/logger';
import { ScrapeResult } from '@src/interfaces/scrape.interface';

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
];

export const scrapeGoogle = async (
  search: string,
  pageIndex: number,
): Promise<ScrapeResult | null> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(userAgent as string);

  try {
    page.on('error', async function (error) {
      logger.error('Scrapping error:', error);
      await browser.close();
    });

    const url = `https://www.google.com/search?q=${search}&start=${pageIndex * 10}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('.LC20lb', { timeout: 15000 });

    const numberOfTopAds = await page.evaluate(
      () => document.querySelectorAll('.KoyyGc').length,
    );

    const numberOfRemainAds = await page.evaluate(
      () => document.querySelectorAll('.uEierd').length,
    );

    const totalAds = numberOfTopAds + numberOfRemainAds;

    const totalLinks = await page.evaluate(
      () => document.querySelectorAll('a').length,
    );
    const htmlCachePage = await page.content();

    await browser.close();

    return {
      totalAds,
      totalLinks,
      htmlCachePage,
    };
  } catch (error) {
    logger.error({ pageIndex, search, error }, 'Error scraping page');
    await browser.close();

    return null;
  } finally {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 500 + 1000),
    );
  }
};
