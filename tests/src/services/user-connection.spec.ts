import UserConnectionModel from '@src/models/user-connection.model';
import sequelize from '@src/config/database';
import * as userConnectionService from '@src/services/user-connection.service';
import { expectException } from '@tests/helpers/expect-exception.helper';
import { mockSocketId } from '@tests/_mocks_/context-mock';
import {
  mockUserId,
  mockUserConnectionCreatePayload,
  mockUserConnectionAttributes,
} from '@tests/_mocks_/user-mock';

jest.mock('@src/models/user-connection.model', () => {
  const mockUserConnectionCreatePayloadModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  };
  return jest.fn(() => mockUserConnectionCreatePayloadModel);
});

describe('User connection service', () => {
  describe('getByUserId', () => {
    const mockFindOne = UserConnectionModel(sequelize).findOne as jest.Mock;

    it('should return correct user connection data', async () => {
      // Arrange
      mockFindOne.mockResolvedValue({
        dataValues: mockUserConnectionAttributes,
      });

      // Act
      const result = await userConnectionService.getByUserId(mockUserId);

      // Assert
      expect(mockFindOne).toHaveBeenCalled();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toMatchObject(mockUserConnectionAttributes);
    });

    it('should throw error if get return empty result', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null);

      // Act + Assert
      await expectException({
        fn: () => userConnectionService.getByUserId(mockUserId),
        exceptionInstance: Error,
        message: 'Can not get user connection',
      });
    });
  });

  describe('createConnection', () => {
    const mockCreate = UserConnectionModel(sequelize).create as jest.Mock;

    it('should create correct user connection with payload', async () => {
      // Arrange
      mockCreate.mockResolvedValue({
        dataValues: mockUserConnectionAttributes,
      });

      // Act
      const result = await userConnectionService.createConnection(
        mockUserConnectionCreatePayload,
      );

      // Assert
      expect(mockCreate).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalledWith(mockUserConnectionCreatePayload);
      expect(result).toMatchObject(mockUserConnectionAttributes);
    });

    it('should throw error if creation return empty result', async () => {
      // Arrange
      mockCreate.mockResolvedValue(null);

      // Act + Assert
      await expectException({
        fn: () =>
          userConnectionService.createConnection(
            mockUserConnectionCreatePayload,
          ),
        exceptionInstance: Error,
        message: 'Create user connection failed',
      });
    });
  });

  describe('deleteConnectionBySocketId', () => {
    const mockDestroy = UserConnectionModel(sequelize).destroy as jest.Mock;

    it('should delete user connection', async () => {
      // Arrange
      mockDestroy.mockResolvedValue(1);

      // Act
      const result =
        await userConnectionService.deleteConnectionBySocketId(mockSocketId);

      // Assert
      expect(mockDestroy).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalledWith({
        where: { socketId: mockSocketId },
      });
      expect(result).toBeTruthy();
    });

    it('should throw error if deletion return empty result', async () => {
      // Arrange
      mockDestroy.mockResolvedValue(null);

      // Act + Assert
      await expectException({
        fn: () =>
          userConnectionService.deleteConnectionBySocketId(mockSocketId),
        exceptionInstance: Error,
        message: 'Delete connection by socket id failed',
      });
    });
  });

  describe('deleteConnectionByUserId', () => {
    const mockDestroy = UserConnectionModel(sequelize).destroy as jest.Mock;

    it('should delete user connection', async () => {
      // Arrange
      mockDestroy.mockResolvedValue(1);

      // Act
      const result =
        await userConnectionService.deleteConnectionByUserId(mockUserId);

      // Assert
      expect(mockDestroy).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toBeTruthy();
    });
  });
});
