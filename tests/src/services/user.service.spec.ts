import UserModel from '@src/models/user.model';
import sequelize from '@src/config/database';
import { expectException } from '@tests/helpers/expect-exception.helper';
import * as userService from '@src/services/user.service';
import { AppError } from '@src/utils/error.util';

jest.mock('@src/models/user.model', () => {
  const mockUserModel = {
    findByPk: jest.fn(),
  };
  return jest.fn(() => mockUserModel);
});

describe('User service', () => {
  const mockUserId = 'mock-user-id';
  const mockFindByPk = UserModel(sequelize).findByPk as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserInfo', () => {
    it('should throw error if user not found', async () => {
      mockFindByPk.mockResolvedValue(null);

      await expectException({
        fn: () => userService.getUserInfo(mockUserId),
        exceptionInstance: AppError,
        message: 'User not found',
      });
    });

    it('should return correct user data', async () => {
      mockFindByPk.mockResolvedValue({
        dataValues: {
          id: mockUserId,
        },
      });

      const result = await userService.getUserInfo(mockUserId);

      expect(mockFindByPk).toHaveBeenCalled();
      expect(mockFindByPk).toHaveBeenCalledWith(mockUserId);
      expect(result).toMatchObject({ id: mockUserId });
    });
  });
});
