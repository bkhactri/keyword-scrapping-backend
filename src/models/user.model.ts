import { DataTypes, Model, Sequelize } from 'sequelize';
import {
  UserAttributes,
  UserCreationAttributes,
} from '../interfaces/user.interface';

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public email!: string;
  public password_hash!: string;
  public created_at!: Date;
}

const UserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          max: 255,
        },
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
      ],
    },
  );

  return User;
};

export default UserModel;
