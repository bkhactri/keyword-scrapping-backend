import { SearchResultAttributes } from '@src/interfaces/search-result.interface';
import { KeywordAttributes } from '@src/interfaces/keyword.interface';
import { KeywordStatus } from '@src/enums/keyword.enum';

export class ReportKeywordDto {
  keywordId: number;
  keyword: string;
  status: KeywordStatus;
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
    keyword: KeywordAttributes<SearchResultAttributes>;
    searchResults: SearchResultAttributes;
    htmlCachePage: string;
  }) {
    this.keywordId = keyword.id;
    this.keyword = keyword.keyword;
    this.status = keyword.status;
    this.totalAds = Number(searchResults?.totalAds);
    this.totalLinks = Number(searchResults?.totalLinks);
    this.createdAt = keyword.createdAt;
    this.updatedAt = keyword.updatedAt;
    this.htmlCachePage = htmlCachePage;
  }
}
