import { DataTypes, Model, Sequelize } from 'sequelize';
import {
  SearchResultAttributes,
  SearchResultCreationPayload,
} from '@src/interfaces/search-result.interface';

class SearchResult
  extends Model<SearchResultAttributes, SearchResultCreationPayload>
  implements SearchResultAttributes
{
  public id!: number;
  public keywordId!: number;
  public totalAds!: number;
  public totalLinks!: number;
  public htmlCacheId?: number | null;
  public createdAt?: Date;
  public updatedAt?: Date;
}

const SearchResultModel = (sequelize: Sequelize) => {
  SearchResult.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      keywordId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'keywords',
          key: 'id',
        },
      },
      totalAds: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalLinks: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      htmlCacheId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'html_page_caches',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      tableName: 'search-results',
      timestamps: true,
    },
  );

  return SearchResult;
};

export default SearchResultModel;
