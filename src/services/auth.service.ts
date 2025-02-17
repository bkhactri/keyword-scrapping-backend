import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';
import sequelize from '../config/database';
import {
  UserAttributes,
  UserSignUpPayload,
  UserSignInPayload,
} from '../interfaces/user.interface';
import { BadRequestError, UnauthorizedError } from '../utils/error.util';
import { UserDto } from '../dtos/user.dto';

const User = UserModel(sequelize);

const generateToken = (user: UserAttributes): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRED_TIME || '1h' },
  );
};

export const signup = async (userData: UserSignUpPayload): Promise<UserDto> => {
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new BadRequestError(
      'Email address is already in use. Please use a different email.',
    );
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = await User.create({
    ...userData,
    passwordHash: hashedPassword,
  });

  return new UserDto(newUser.dataValues);
};

export const login = async (loginData: UserSignInPayload): Promise<UserDto> => {
  const user = await User.findOne({ where: { email: loginData.email } });

  if (
    !user ||
    !bcrypt.compareSync(loginData.password, user.dataValues.passwordHash)
  ) {
    throw new UnauthorizedError(
      'Incorrect username or password. Please try again',
    );
  }

  return new UserDto({
    ...user.dataValues,
    accessToken: generateToken(user.dataValues),
  });
};
