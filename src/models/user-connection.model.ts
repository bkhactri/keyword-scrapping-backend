import { DataTypes, Model, Sequelize } from 'sequelize';
import {
  UserConnectionAttributes,
  UserConnectionCreationPayload,
} from '@src/interfaces/user.interface';

class UserConnection
  extends Model<UserConnectionAttributes, UserConnectionCreationPayload>
  implements UserConnectionAttributes
{
  public id!: number;
  public userId!: string;
  public socketId!: string;
}

const UserConnectionModel = (sequelize: Sequelize) => {
  UserConnection.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      socketId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'user_connections',
      timestamps: false,
    },
  );

  return UserConnection;
};

export default UserConnectionModel;
