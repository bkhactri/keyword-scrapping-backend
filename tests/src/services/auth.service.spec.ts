import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  UserAttributes,
  UserAuthenticateAttributes,
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
    password_hash: 'hashedPassword',
    created_at: new Date('2024-12-13 07:55:17.615+00'),
  };
  const userData: UserAuthenticateAttributes = {
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
      mockCreate.mockResolvedValue(mockUser);

      const newUser = await authService.signup(userData);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockHash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockCreate).toHaveBeenCalledWith({
        ...userData,
        password_hash: 'hashedPassword',
      });
      expect(newUser).toEqual(mockUser);
    });

    it('should throw BadRequestError if email already exists', async () => {
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUser,
        },
      });

      await expectException({
        fn: () => authService.signup(userData),
        exceptionInstance: AppError,
        message:
          'Email address is already in use. Please use a different email.',
      });
    });
  });

  describe('login', () => {
    it('should return a token if credentials are valid', async () => {
      const loginData: UserAuthenticateAttributes = {
        email: 'test@example.com',
        password: 'password',
      };
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUser,
        },
      });
      mockCompareSync.mockReturnValue(true);
      mockSign.mockReturnValue('mock-token');

      const token = await authService.login(loginData);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(mockCompareSync).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password_hash,
      );
      expect(token).toBe('mock-token');
    });

    it('should throw UnauthorizedError if credentials are invalid', async () => {
      const loginData: UserAuthenticateAttributes = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUser,
        },
      });
      mockCompareSync.mockReturnValue(false);

      await expectException({
        fn: () => authService.login(loginData),
        exceptionInstance: AppError,
        message: 'Incorrect username or password. Please try again',
      });
    });

    it('should throw UnauthorizedError if user not found', async () => {
      const loginData: UserAuthenticateAttributes = {
        email: 'not-found@example.com',
        password: 'password',
      };
      mockFindOne.mockResolvedValue(null);

      await expectException({
        fn: () => authService.login(loginData),
        exceptionInstance: AppError,
        message: 'Incorrect username or password. Please try again',
      });
    });
  });
});
