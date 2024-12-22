export interface SearchResultAttributes {
  id?: number;
  keywordId?: number;
  totalAds?: number;
  totalLinks?: number;
  htmlCacheId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SearchResultCreationPayload
  extends Omit<SearchResultAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
