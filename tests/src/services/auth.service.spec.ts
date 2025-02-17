import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  UserAttributes,
  UserSignUpPayload,
  UserSignInPayload,
} from '@src/interfaces/user.interface';
import { AppError } from '@src/utils/error.util';
import UserModel from '@src/models/user.model';
import sequelize from '@src/config/database';
import * as authService from '@src/services/auth.service';
import { expectException } from '@tests/helpers/expect-exception.helper';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compareSync: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));
jest.mock('@src/models/user.model', () => {
  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };
  return jest.fn(() => mockUserModel);
});

describe('Auth service', () => {
  const mockFindOne = UserModel(sequelize).findOne as jest.Mock;
  const mockCreate = UserModel(sequelize).create as jest.Mock;
  const mockHash = bcrypt.hash as jest.Mock;
  const mockCompareSync = bcrypt.compareSync as jest.Mock;
  const mockSign = jwt.sign as jest.Mock;

  const mockUser: UserAttributes = {
    id: 1,
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    firstName: 'mock first name',
    lastName: 'mock last name',
    createdAt: new Date('2024-12-13 07:55:17.615+00'),
  };

  const userSignUpPayload: UserSignUpPayload = {
    email: 'test@example.com',
    password: 'password',
    firstName: 'mock first name',
    lastName: 'mock last name',
  };

  const userSignInPayload: UserSignInPayload = {
    email: 'test@example.com',
    password: 'password',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return the user object', async () => {
      mockFindOne.mockResolvedValue(null);
      mockHash.mockResolvedValue('hashedPassword');
      mockCreate.mockResolvedValue({
        dataValues: {
          ...mockUser,
        },
      });

      const newUser = await authService.signup(userSignUpPayload);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: userSignUpPayload.email },
      });
      expect(mockHash).toHaveBeenCalledWith(userSignUpPayload.password, 10);
      expect(mockCreate).toHaveBeenCalledWith({
        ...userSignUpPayload,
        passwordHash: 'hashedPassword',
      });
      expect(newUser).toMatchObject({
        id: 1,
        email: 'test@example.com',
        firstName: 'mock first name',
        lastName: 'mock last name',
      });
    });

    it('should throw BadRequestError if email already exists', async () => {
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUser,
        },
      });

      await expectException({
        fn: () => authService.signup(userSignUpPayload),
        exceptionInstance: AppError,
        message:
          'Email address is already in use. Please use a different email.',
      });
    });
  });

  describe('login', () => {
    it('should return a token if credentials are valid', async () => {
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUser,
        },
      });
      mockCompareSync.mockReturnValue(true);
      mockSign.mockReturnValue('mock-token');

      const token = await authService.login(userSignInPayload);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: userSignInPayload.email },
      });
      expect(mockCompareSync).toHaveBeenCalledWith(
        userSignInPayload.password,
        mockUser.passwordHash,
      );
      expect(token).toMatchObject({
        accessToken: 'mock-token',
        email: 'test@example.com',
        firstName: 'mock first name',
        id: 1,
        lastName: 'mock last name',
      });
    });

    it('should throw UnauthorizedError if credentials are invalid', async () => {
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUser,
        },
      });
      mockCompareSync.mockReturnValue(false);

      await expectException({
        fn: () => authService.login(userSignInPayload),
        exceptionInstance: AppError,
        message: 'Incorrect username or password. Please try again',
      });
    });

    it('should throw UnauthorizedError if user not found', async () => {
      mockFindOne.mockResolvedValue(null);

      await expectException({
        fn: () => authService.login(userSignInPayload),
        exceptionInstance: AppError,
        message: 'Incorrect username or password. Please try again',
      });
    });
  });
});
