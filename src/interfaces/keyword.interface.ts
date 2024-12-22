import { KeywordStatus } from '@src/enums/keyword.enum';
import { SearchResult } from '@src/models/search-result.model';
import { Pagination } from './common.interface';
import { SearchResultAttributes } from './search-result.interface';

export interface KeywordAttributes<SearchResultType = SearchResult> {
  id: number;
  userId: string;
  keyword: string;
  status: KeywordStatus;
  searchResult?: SearchResultType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KeywordCreationPayload
  extends Omit<
    KeywordAttributes,
    'id' | 'createdAt' | 'updatedAt' | 'searchResult'
  > {}

export interface KeywordProcessingPayload {
  userId: string;
  keyword: string;
  keywordId: number;
}

export interface KeywordList extends Pagination {
  total: number;
  keywords: KeywordAttributes<SearchResultAttributes>[];
}
