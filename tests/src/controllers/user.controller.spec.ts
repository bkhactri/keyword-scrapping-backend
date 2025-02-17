import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as userController from '@src/controllers/user.controller';
import * as userService from '@src/services/user.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import { mockUser } from '@tests/_mocks_/context-mock';

jest.mock('@src/services/user.service');

describe('User controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserInfo', () => {
    it('should throw error if user service cause error', async () => {
      const mockError = new Error('User not found');
      requestMock.user = mockUser;
      (userService.getUserInfo as jest.Mock).mockRejectedValue(mockError);

      await userController.getUserInfo(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(mockError);
    });

    it('should return user info and return 200 if successful', async () => {
      requestMock.user = mockUser;
      (userService.getUserInfo as jest.Mock).mockResolvedValue(mockUser);

      await userController.getUserInfo(requestMock, responseMock, nextFuncMock);

      expect(userService.getUserInfo).toHaveBeenCalledWith(mockUser.id);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith(mockUser);
    });
  });
});
