import {
  getRequestMock,
  getResponseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as userController from '@src/controllers/user.controller';
import * as userService from '@src/services/user.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import { mockUserDto, mockUserTokenPayload } from '@tests/_mocks_/user-mock';

jest.mock('@src/services/user.service');

describe('User controller', () => {
  describe('getUserInfo', () => {
    const requestMock = getRequestMock();
    const responseMock = getResponseMock();

    requestMock.user = mockUserTokenPayload;

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error if user service getUserInfo cause error', async () => {
      // Arrange
      const mockError = new Error('User not found');
      (userService.getUserInfo as jest.Mock).mockRejectedValue(mockError);

      // Act
      await userController.getUserInfo(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(mockError);
    });

    it('should return user info and return 200 if successful', async () => {
      // Arrange
      (userService.getUserInfo as jest.Mock).mockResolvedValue(mockUserDto);

      // Act
      await userController.getUserInfo(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(userService.getUserInfo).toHaveBeenCalledWith(mockUserDto.id);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith(mockUserDto);
    });
  });
});
