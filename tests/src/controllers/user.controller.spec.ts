import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as userController from '@src/controllers/user.controller';
import * as userService from '@src/services/user.service';
import { HttpStatus } from '@src/enums/http-status.enum';

jest.mock('@src/services/user.service');

describe('User controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserInfo', () => {
    const mockUser = {
      id: 'mock-user-id',
      email: 'mock-user-email',
      firstName: 'mock-first-name',
      lastName: 'mock-last-name',
    };

    it('should throw error if user service cause error', async () => {
      requestMock.user = mockUser;
      const error = new Error('User not found');
      (userService.getUserInfo as jest.Mock).mockRejectedValue(error);

      await userController.getUserInfo(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(error);
    });

    it('should return user info and return 200 if successful', async () => {
      requestMock.user = mockUser;
      (userService.getUserInfo as jest.Mock).mockResolvedValue(mockUser);

      await userController.getUserInfo(requestMock, responseMock, nextFuncMock);

      expect(userService.getUserInfo).toHaveBeenCalledWith('mock-user-id');
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith(mockUser);
    });
  });
});
