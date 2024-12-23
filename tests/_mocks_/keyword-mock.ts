import {
  KeywordAttributes,
  KeywordList,
  KeywordProcessingPayload,
} from '@src/interfaces/keyword.interface';
import { mockDefaultPagination } from './context-mock';
import { KeywordDto } from '@src/dtos/keyword.dto';
import { KeywordStatus } from '@src/enums/keyword.enum';
import {
  SearchResultAttributes,
  SearchResultCreationPayload,
} from '@src/interfaces/search-result.interface';
import { HtmlPageCacheAttributes } from '@src/interfaces/html-page-cache.interface';
import { ReportKeywordDto } from '@src/dtos/report.dto';
import { ScrapeResult } from '@src/interfaces/scrape.interface';
import { mockUserId } from './user-mock';

export const mockKeywordText: string = 'mock-keyword';

export const mockKeywordId: number = 10101;

export const mockKeywordRawList: string[] = ['key1', 'key2', 'key3'];

export const mockHtmlPageCache: string = `
    <html>
        <div class="KoyyGc">Top Ad</div>
        <div class="uEierd">Remain Ad</div>
        <a>Link 1</a>
        <a>Link 2</a>
        <a>Link 3</a>
        <a>Link 4</a>
    </html>
`;

export const mockHtmlPageCacheAttributes: HtmlPageCacheAttributes = {
  id: 1,
  html: mockHtmlPageCache,
  createdAt: new Date('2024-12-13 07:55:17.615+00'),
  updatedAt: new Date('2024-12-13 07:55:17.615+00'),
};

export const mockSearchResultAttributes: SearchResultAttributes = {
  id: 1,
  keywordId: mockKeywordId,
  totalAds: 1,
  totalLinks: 4,
  htmlCacheId: 1,
  createdAt: new Date('2024-12-13 07:55:17.615+00'),
  updatedAt: new Date('2024-12-13 07:55:17.615+00'),
};

export const mockKeywordAttributes: KeywordAttributes = {
  id: mockKeywordId,
  userId: '9b029d2c-a983-4dae-bd82-58b173c864a3',
  keyword: 'mock-keyword',
  status: KeywordStatus.Completed,
  createdAt: new Date('2024-12-13 07:55:17.615+00'),
  updatedAt: new Date('2024-12-13 07:55:17.615+00'),
};

export const mockKeywordDto: KeywordDto = {
  ...mockKeywordAttributes,
  searchResult: mockSearchResultAttributes,
};

export const mockKeywordList: KeywordList = {
  total: 1,
  keywords: [mockKeywordDto],
  ...mockDefaultPagination,
};

export const mockReportKeywordDto: ReportKeywordDto = {
  keywordId: mockKeywordDto.id,
  keyword: mockKeywordDto.keyword,
  status: mockKeywordDto.status,
  totalAds: Number(mockSearchResultAttributes.totalAds),
  totalLinks: Number(mockSearchResultAttributes.totalLinks),
  htmlCachePage: mockHtmlPageCacheAttributes.html,
  createdAt: mockKeywordDto.createdAt,
  updatedAt: mockKeywordDto.updatedAt,
};

export const mockScrapeResult: ScrapeResult = {
  totalAds: Number(mockSearchResultAttributes.totalAds),
  totalLinks: Number(mockSearchResultAttributes.totalLinks),
  htmlCachePage: mockHtmlPageCacheAttributes.html,
};

export const mockKeywordProcessingPayload: KeywordProcessingPayload = {
  userId: mockUserId,
  keyword: mockKeywordText,
  keywordId: mockKeywordId,
};

export const mockSearchResultCreationPayload: SearchResultCreationPayload = {
  keywordId: mockKeywordId,
  totalAds: mockSearchResultAttributes.totalAds,
  totalLinks: mockSearchResultAttributes.totalLinks,
  htmlCacheId: mockHtmlPageCacheAttributes.id,
};
