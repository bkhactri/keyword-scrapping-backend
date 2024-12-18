import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '@src/utils/error.util';
import UserModel from '@src/models/user.model';
import sequelize from '@src/config/database';
import * as authService from '@src/services/auth.service';
import { expectException } from '@tests/helpers/expect-exception.helper';
import {
  mockAccessToken,
  mockUserAttributes,
  userSignInPayload,
  userSignUpPayload,
} from '@tests/_mocks_/context-mock';

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return the user object', async () => {
      mockFindOne.mockResolvedValue(null);
      mockHash.mockResolvedValue(mockUserAttributes.passwordHash);
      mockCreate.mockResolvedValue({
        dataValues: {
          ...mockUserAttributes,
        },
      });

      const newUser = await authService.signup(userSignUpPayload);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: userSignUpPayload.email },
      });
      expect(mockHash).toHaveBeenCalledWith(userSignUpPayload.password, 10);
      expect(mockCreate).toHaveBeenCalledWith({
        ...userSignUpPayload,
        passwordHash: mockUserAttributes.passwordHash,
      });
      expect(newUser).toMatchObject({
        id: mockUserAttributes.id,
        email: mockUserAttributes.email,
        firstName: mockUserAttributes.firstName,
        lastName: mockUserAttributes.lastName,
      });
    });

    it('should throw BadRequestError if email already exists', async () => {
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUserAttributes,
        },
      });

      await expectException({
        fn: () => authService.signup(userSignUpPayload),
        exceptionInstance: AppError,
        message:
          'Email address is already in use. Please use a different email',
      });
    });
  });

  describe('login', () => {
    it('should return a token if credentials are valid', async () => {
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUserAttributes,
        },
      });
      mockCompareSync.mockReturnValue(true);
      mockSign.mockReturnValue(mockAccessToken);

      const user = await authService.login(userSignInPayload);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: userSignInPayload.email },
      });
      expect(mockCompareSync).toHaveBeenCalledWith(
        userSignInPayload.password,
        mockUserAttributes.passwordHash,
      );
      expect(user).toMatchObject({
        id: mockUserAttributes.id,
        accessToken: mockAccessToken,
        email: mockUserAttributes.email,
        firstName: mockUserAttributes.firstName,
        lastName: mockUserAttributes.lastName,
      });
    });

    it('should throw UnauthorizedError if credentials are invalid', async () => {
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUserAttributes,
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
