import { DataTypes, Model, Sequelize } from 'sequelize';
import { KeywordStatus } from '@src/enums/keyword.enum';
import {
  KeywordAttributes,
  KeywordCreationPayload,
} from '@src/interfaces/keyword.interface';

class Keyword
  extends Model<KeywordAttributes, KeywordCreationPayload>
  implements KeywordAttributes
{
  public id!: number;
  public userId!: string;
  public keyword!: string;
  public status!: KeywordStatus;
  public createdAt!: Date;
}

const KeywordModel = (sequelize: Sequelize) => {
  Keyword.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      keyword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(KeywordStatus)),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'keywords',
      timestamps: false,
    },
  );

  return Keyword;
};

export default KeywordModel;
