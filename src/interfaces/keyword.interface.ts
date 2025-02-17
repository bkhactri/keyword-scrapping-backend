import { KeywordStatus } from '@src/enums/keyword.enum';
import { Pagination } from './common.interface';

export interface KeywordAttributes {
  id: number;
  userId: string;
  keyword: string;
  status: KeywordStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KeywordCreationPayload
  extends Omit<KeywordAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface KeywordProcessingPayload {
  userId: string;
  keyword: string;
  keywordId: number;
}

export interface KeywordList extends Pagination {
  total: number;
  keywords: KeywordAttributes[];
}
