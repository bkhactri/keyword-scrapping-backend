import { SearchResult, HtmlPageCache } from '@src/models';
import { logger } from '@src/config/logger';
import { ScrapeResult } from '@src/interfaces/scrape.interface';
import { KeywordProcessingPayload } from '@src/interfaces/keyword.interface';
import {
  SearchResultAttributes,
  SearchResultCreationPayload,
} from '@src/interfaces/search-result.interface';

export const saveGoogleScrapeResult = async (
  context: KeywordProcessingPayload,
  payload: ScrapeResult,
): Promise<SearchResultAttributes> => {
  const { userId, keywordId } = context;

  logger.info({ userId, keywordId }, 'Saving search result');

  const htmlCacheId = await saveHtmlPageCache(payload.htmlCachePage);
  const savedScrapeResult = await saveSearchResultByKeyword({
    keywordId,
    htmlCacheId,
    totalAds: payload.totalAds,
    totalLinks: payload.totalLinks,
  });

  return savedScrapeResult;
};

export const saveSearchResultByKeyword = async (
  payload: SearchResultCreationPayload,
): Promise<SearchResultAttributes> => {
  try {
    const savedSearchResult = await SearchResult.create({
      keywordId: payload.keywordId,
      totalAds: payload.totalAds,
      totalLinks: payload.totalLinks,
      htmlCacheId: payload?.htmlCacheId,
    });

    return savedSearchResult.dataValues;
  } catch (error) {
    logger.error({ error }, 'Error when saving html page cache');
    throw error;
  }
};

export const saveHtmlPageCache = async (
  htmlPageCache: string,
): Promise<number> => {
  try {
    const savedPage = await HtmlPageCache.create({ html: htmlPageCache });
    return savedPage.dataValues.id;
  } catch (error) {
    logger.error({ error }, 'Error when saving html page cache');
    throw error;
  }
};
