import { KeywordAttributes } from '@src/interfaces/keyword.interface';
import { KeywordStatus } from '@src/enums/keyword.enum';

export class KeywordDto {
  id: number;
  userId: string;
  keyword: string;
  status: KeywordStatus;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(keyword: KeywordAttributes) {
    this.id = keyword.id;
    this.userId = keyword.userId;
    this.keyword = keyword.keyword;
    this.status = keyword.status;
    this.createdAt = keyword?.createdAt;
    this.updatedAt = keyword?.updatedAt;
  }
}
