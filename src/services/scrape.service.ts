import puppeteer from 'puppeteer';
import randomUserAgent from 'random-useragent';
import { logger } from '@src/config/logger';
import { ScrapeResult } from '@src/interfaces/scrape.interface';

export const scrapeGoogle = async (
  search: string,
  pageIndex: number,
): Promise<ScrapeResult | null> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const userAgent = randomUserAgent.getRandom();
  await page.setUserAgent(userAgent as string);

  try {
    page.on('error', async function (error) {
      logger.error('Scrapping error:', error);
      await browser.close();
    });

    await page.setViewport({ width: 1280, height: 800 });
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 2000 + 1000),
    );

    const url = `https://www.google.com/search?q=${search}&start=${pageIndex * 10}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('body');

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
  }
};
