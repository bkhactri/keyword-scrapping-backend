import UserModel from '@src/models/user.model';
import sequelize from '@src/config/database';
import { expectException } from '@tests/helpers/expect-exception.helper';
import * as userService from '@src/services/user.service';
import { AppError } from '@src/utils/error.util';
import {
  mockUserId,
  mockUserAttributes,
  mockUserDto,
} from '@tests/_mocks_/user-mock';

jest.mock('@src/models/user.model', () => {
  const mockUserModel = {
    findByPk: jest.fn(),
  };
  return jest.fn(() => mockUserModel);
});

describe('User service', () => {
  const mockFindByPk = UserModel(sequelize).findByPk as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserInfo', () => {
    it('should throw error if user not found', async () => {
      // Arrange
      mockFindByPk.mockResolvedValue(null);

      // Act + Assert
      await expectException({
        fn: () => userService.getUserInfo(mockUserId),
        exceptionInstance: AppError,
        message: 'User not found',
      });
    });

    it('should return correct user data', async () => {
      // Arrange
      mockFindByPk.mockResolvedValue({
        dataValues: mockUserAttributes,
      });

      // Act
      const result = await userService.getUserInfo(mockUserId);

      // Assert
      expect(mockFindByPk).toHaveBeenCalled();
      expect(mockFindByPk).toHaveBeenCalledWith(mockUserId);
      expect(result).toMatchObject(mockUserDto);
    });
  });
});
