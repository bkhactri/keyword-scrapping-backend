import puppeteer, { Page } from 'puppeteer';
import randomUserAgent from 'random-useragent';
import { logger } from '@src/config/logger';
import { ScrapeResult } from '@src/interfaces/scrape.interface';
import { randomDelay } from '@src/utils/timer.util';

export const getRandomUserAgent = () => randomUserAgent.getRandom();

export const buildQueryUrl = (
  search: string,
  pageIndex: number = 0,
): string => {
  let url = 'https://www.google.com/search?';

  if (search) {
    url += `q=${search}&`;
  }

  if (search && pageIndex !== undefined && pageIndex !== null) {
    url += `start=${pageIndex * 10}`;
  }

  return url;
};

export const parseHtml = async (page: Page): Promise<ScrapeResult> => {
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

  return {
    totalAds,
    totalLinks,
    htmlCachePage,
  };
};

export const scrapeGoogle = async (
  search: string,
  pageIndex: number = 0,
): Promise<ScrapeResult | null> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  page.on('error', async function (error) {
    logger.error({ error }, 'Scrapping error');
    await browser.close();
  });

  const userAgent = getRandomUserAgent();
  await page.setUserAgent(userAgent);

  try {
    await page.setViewport({ width: 1280, height: 800 });

    // Random delay between 1 minute and 3 minutes
    await randomDelay(2);

    const url = buildQueryUrl(search, pageIndex);

    // Open page and scrapping
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('body');

    const scrapeData = await parseHtml(page);

    await browser.close();

    return scrapeData;
  } catch (error) {
    console.log(error);
    logger.error({ pageIndex, search, error }, 'Error scraping page');
    await browser.close();

    return null;
  }
};
