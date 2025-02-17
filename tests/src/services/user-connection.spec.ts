import UserConnectionModel from '@src/models/user-connection.model';
import sequelize from '@src/config/database';
import * as userConnectionService from '@src/services/user-connection.service';
import { expectException } from '@tests/helpers/expect-exception.helper';
import {
  mockSocketId,
  mockUserConnection,
  mockUserId,
} from '@tests/_mocks_/context-mock';

jest.mock('@src/models/user-connection.model', () => {
  const mockUserConnectionModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  };
  return jest.fn(() => mockUserConnectionModel);
});

describe('User connection service', () => {
  const mockFindOne = UserConnectionModel(sequelize).findOne as jest.Mock;
  const mockCreate = UserConnectionModel(sequelize).create as jest.Mock;
  const mockDestroy = UserConnectionModel(sequelize).destroy as jest.Mock;

  describe('getByUserId', () => {
    it('should return correct user connection data', async () => {
      mockFindOne.mockResolvedValue({
        dataValues: {
          id: mockUserId,
        },
      });

      const result = await userConnectionService.getByUserId(mockUserId);

      expect(mockFindOne).toHaveBeenCalled();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toMatchObject({ id: mockUserId });
    });

    it('should throw error if get return empty result', async () => {
      mockFindOne.mockResolvedValue(null);

      await expectException({
        fn: () => userConnectionService.getByUserId(mockUserId),
        exceptionInstance: Error,
        message: 'Can not get user connection',
      });
    });
  });

  describe('createConnection', () => {
    it('should create correct user connection with payload', async () => {
      mockCreate.mockResolvedValue({
        dataValues: {
          id: 1,
          ...mockUserConnection,
        },
      });

      const result =
        await userConnectionService.createConnection(mockUserConnection);

      expect(mockCreate).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalledWith(mockUserConnection);
      expect(result).toMatchObject({
        id: 1,
        ...mockUserConnection,
      });
    });

    it('should throw error if creation return empty result', async () => {
      mockCreate.mockResolvedValue(null);

      await expectException({
        fn: () => userConnectionService.createConnection(mockUserConnection),
        exceptionInstance: Error,
        message: 'Create user connection failed',
      });
    });
  });

  describe('deleteConnectionBySocketId', () => {
    it('should delete user connection', async () => {
      mockDestroy.mockResolvedValue(1);

      const result =
        await userConnectionService.deleteConnectionBySocketId(mockSocketId);

      expect(mockDestroy).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalledWith({
        where: { socketId: mockSocketId },
      });
      expect(result).toBeTruthy();
    });

    it('should throw error if deletion return empty result', async () => {
      mockDestroy.mockResolvedValue(null);

      await expectException({
        fn: () =>
          userConnectionService.deleteConnectionBySocketId(mockSocketId),
        exceptionInstance: Error,
        message: 'Delete connection by socket id failed',
      });
    });
  });

  describe('deleteConnectionByUserId', () => {
    it('should delete user connection', async () => {
      mockDestroy.mockResolvedValue(1);

      const result =
        await userConnectionService.deleteConnectionByUserId(mockUserId);

      expect(mockDestroy).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toBeTruthy();
    });
  });
});
