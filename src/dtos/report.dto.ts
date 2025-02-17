import { SearchResultAttributes } from '@src/interfaces/search-result.interface';
import { KeywordAttributes } from '@src/interfaces/keyword.interface';

export class ReportKeywordDto {
  keywordId: number;
  keyword: string;
  totalAds: number;
  totalLinks: number;
  htmlCachePage: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor({
    keyword,
    searchResults,
    htmlCachePage,
  }: {
    keyword: KeywordAttributes;
    searchResults: SearchResultAttributes;
    htmlCachePage: string;
  }) {
    this.keywordId = keyword.id;
    this.keyword = keyword.keyword;
    this.totalAds = searchResults.totalAds;
    this.totalLinks = searchResults.totalLinks;
    this.createdAt = keyword.createdAt;
    this.updatedAt = keyword.updatedAt;
    this.htmlCachePage = htmlCachePage;
  }
}
