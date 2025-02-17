import {
  getRequestMock,
  getResponseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import { matchedData } from 'express-validator';
import * as authService from '@src/services/auth.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import * as authController from '@src/controllers/auth.controller';
import { BadRequestError } from '@src/utils/error.util';
import {
  mockUserSignInPayload,
  mockUserSignUpPayload,
} from '@tests/_mocks_/user-mock';
import {
  mockUserDto,
  mockUserDtoWithAccessToken,
} from '@tests/_mocks_/user-mock';

jest.mock('express-validator');
jest.mock('@src/services/auth.service');

describe('Auth controller', () => {
  const requestMock = getRequestMock();
  const responseMock = getResponseMock();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return 201 if successful', async () => {
      // Arrange
      (matchedData as jest.Mock).mockReturnValue(mockUserSignUpPayload);
      (authService.signup as jest.Mock).mockResolvedValue(mockUserDto);

      // Act
      await authController.signup(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(authService.signup).toHaveBeenCalledWith(mockUserSignUpPayload);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Created);
      expect(responseMock.json).toHaveBeenCalledWith(mockUserDto);
    });

    it('should call next with error if auth service signup throw an error', async () => {
      // Arrange
      const error = new Error('Signup failed');
      (matchedData as jest.Mock).mockReturnValue({});
      (authService.signup as jest.Mock).mockRejectedValue(error);

      // Act
      await authController.signup(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(authService.signup).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(error);
      expect(responseMock.status).not.toHaveBeenCalled();
      expect(responseMock.json).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a token and 200 if successful', async () => {
      // Arrange
      (matchedData as jest.Mock).mockReturnValue(mockUserSignInPayload);
      (authService.login as jest.Mock).mockResolvedValue(
        mockUserDtoWithAccessToken,
      );

      // Act
      await authController.login(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockUserSignInPayload);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith(
        mockUserDtoWithAccessToken,
      );
      expect(nextFuncMock).not.toHaveBeenCalled();
    });

    it('should call next with error if auth service login throw an error', async () => {
      // Arrange
      const error = new BadRequestError('Error');
      (matchedData as jest.Mock).mockReturnValue({});
      (authService.login as jest.Mock).mockRejectedValue(error);

      // Act
      await authController.login(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(authService.login).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(error);
      expect(responseMock.status).not.toHaveBeenCalled();
      expect(responseMock.json).not.toHaveBeenCalled();
    });
  });
});
