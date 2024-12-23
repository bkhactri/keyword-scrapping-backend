import { Page } from 'puppeteer';
import { ScrapeResult } from '@src/interfaces/scrape.interface';

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
