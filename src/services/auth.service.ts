import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';
import sequelize from '../config/database';
import {
  UserAttributes,
  UserAuthenticateAttributes,
} from '../interfaces/user.interface';
import { BadRequestError, UnauthorizedError } from '../utils/error.util';

const User = UserModel(sequelize);

const generateToken = (user: UserAttributes): string => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRED_TIME || '1h' },
  );
};

export const signup = async (
  userData: UserAuthenticateAttributes,
): Promise<UserAttributes> => {
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new BadRequestError(
      'Email address is already in use. Please use a different email.',
    );
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = await User.create({
    ...userData,
    password_hash: hashedPassword,
  });

  return newUser;
};

export const login = async (
  loginData: UserAuthenticateAttributes,
): Promise<string> => {
  const user = await User.findOne({ where: { email: loginData.email } });

  if (
    !user ||
    !bcrypt.compareSync(loginData.password, user.dataValues.password_hash)
  ) {
    throw new UnauthorizedError(
      'Incorrect username or password. Please try again',
    );
  }

  return generateToken(user);
};
