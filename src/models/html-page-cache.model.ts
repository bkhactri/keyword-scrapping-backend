import { DataTypes, Model, Sequelize } from 'sequelize';
import {
  HtmlPageCacheAttributes,
  HtmlPageCacheCreationPayload,
} from '@src/interfaces/html-page-cache.interface';

class HtmlPageCache
  extends Model<HtmlPageCacheAttributes, HtmlPageCacheCreationPayload>
  implements HtmlPageCacheAttributes
{
  public id!: number;
  public html!: string;
  public createdAt!: Date;
}

const HtmlPageCacheModel = (sequelize: Sequelize) => {
  HtmlPageCache.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      html: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'html_page_caches',
      timestamps: false,
    },
  );

  return HtmlPageCache;
};

export default HtmlPageCacheModel;
