export interface HtmlPageCacheAttributes {
  id: number;
  html: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HtmlPageCacheCreationPayload
  extends Omit<HtmlPageCacheAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
