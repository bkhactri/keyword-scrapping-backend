import { KeywordAttributes } from '@src/interfaces/keyword.interface';
import { SearchResultAttributes } from '@src/interfaces/search-result.interface';
import { KeywordStatus } from '@src/enums/keyword.enum';

export class KeywordDto {
  id: number;
  userId: string;
  keyword: string;
  status: KeywordStatus;
  searchResult?: SearchResultAttributes;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(keyword: KeywordAttributes<SearchResultAttributes>) {
    this.id = keyword.id;
    this.userId = keyword.userId;
    this.keyword = keyword.keyword;
    this.status = keyword.status;
    this.searchResult = keyword?.searchResult;
    this.createdAt = keyword?.createdAt;
    this.updatedAt = keyword?.updatedAt;
  }
}
