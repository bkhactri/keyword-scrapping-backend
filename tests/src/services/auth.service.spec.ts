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
  mockUserSignInPayload,
  mockUserSignUpPayload,
} from '@tests/_mocks_/user-mock';

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
      // Arrange
      mockFindOne.mockResolvedValue(null);
      mockHash.mockResolvedValue(mockUserAttributes.passwordHash);
      mockCreate.mockResolvedValue({
        dataValues: {
          ...mockUserAttributes,
        },
      });

      // Act
      const newUser = await authService.signup(mockUserSignUpPayload);

      // Assert
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: mockUserSignUpPayload.email },
      });
      expect(mockHash).toHaveBeenCalledWith(mockUserSignUpPayload.password, 10);
      expect(mockCreate).toHaveBeenCalledWith({
        ...mockUserSignUpPayload,
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
      // Arrange
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUserAttributes,
        },
      });

      // Act + Assert
      await expectException({
        fn: () => authService.signup(mockUserSignUpPayload),
        exceptionInstance: AppError,
        message:
          'Email address is already in use. Please use a different email',
      });
    });
  });

  describe('login', () => {
    it('should return a token if credentials are valid', async () => {
      // Arrange
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUserAttributes,
        },
      });
      mockCompareSync.mockReturnValue(true);
      mockSign.mockReturnValue(mockAccessToken);

      // Act
      const user = await authService.login(mockUserSignInPayload);

      // Assert
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: mockUserSignInPayload.email },
      });
      expect(mockCompareSync).toHaveBeenCalledWith(
        mockUserSignInPayload.password,
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
      // Arrange
      mockFindOne.mockResolvedValue({
        dataValues: {
          ...mockUserAttributes,
        },
      });
      mockCompareSync.mockReturnValue(false);

      // Act + Assert
      await expectException({
        fn: () => authService.login(mockUserSignInPayload),
        exceptionInstance: AppError,
        message: 'Incorrect username or password. Please try again',
      });
    });

    it('should throw UnauthorizedError if user not found', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null);

      // Act + Assert
      await expectException({
        fn: () => authService.login(mockUserSignInPayload),
        exceptionInstance: AppError,
        message: 'Incorrect username or password. Please try again',
      });
    });
  });
});
