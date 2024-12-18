import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { SearchResult, HtmlPageCache } from '@src/models';
import { logger } from '@src/config/logger';
import { ScrapeResult } from '@src/interfaces/scrape.interface';
import { KeywordProcessingPayload } from '@src/interfaces/keyword.interface';
import {
  SearchResultAttributes,
  SearchResultCreationPayload,
} from '@src/interfaces/search-result.interface';
import * as keywordService from '@src/services/keyword.service';
import { BadRequestError } from '@src/utils/error.util';
import { KeywordStatus } from '@src/enums/keyword.enum';
import { ReportKeywordDto } from '@src/dtos/report.dto';

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

export const getKeywordScrappedResult = async (
  userId: string,
  keywordId: number,
): Promise<ReportKeywordDto> => {
  try {
    const keywordInfo = await keywordService.getByKeywordId(keywordId);

    if (!keywordInfo) {
      throw new BadRequestError('Keyword not found');
    }

    if (keywordInfo.status !== KeywordStatus.Completed) {
      throw new BadRequestError('Can not get in-completed keyword');
    }

    const searchResultData = await SearchResult.findOne({
      where: {
        keywordId: keywordInfo.id,
      },
    });

    if (!searchResultData?.dataValues) {
      throw new BadRequestError('Can not found search result of keyword');
    }

    const htmlPageCacheId = searchResultData?.dataValues?.htmlCacheId;
    if (!htmlPageCacheId) {
      throw new BadRequestError('No html page cache attached');
    }

    const htmlPageCache = await HtmlPageCache.findByPk(
      htmlPageCacheId as number,
    );

    if (!htmlPageCache?.dataValues) {
      throw new BadRequestError('Can not found html page cache of keyword');
    }

    // Sanitize HTML page cache
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const cleanHtmlPageCache = purify.sanitize(htmlPageCache?.dataValues.html);

    return new ReportKeywordDto({
      keyword: keywordInfo,
      searchResults: searchResultData.dataValues,
      htmlCachePage: cleanHtmlPageCache,
    });
  } catch (error) {
    throw error;
  }
};
