import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import { validationResult, matchedData } from 'express-validator';
import * as authService from '@src/services/auth.service';
import { HttpStatus } from '@src/enums/http-status.enum';
import * as authController from '@src/controllers/auth.controller';
import { BadRequestError } from '@src/utils/error.util';
import { mockAccessToken } from '@tests/_mocks_/context-mock';

jest.mock('express-validator');
jest.mock('@src/services/auth.service');

describe('Auth controller', () => {
  const mockValidatedData = {
    email: 'test@example.com',
    passwordHash: 'password',
  };
  const mockValidateMessage = { msg: 'Email is required' };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should return 400 with validation errors if validation fails', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([mockValidateMessage]),
      });

      await authController.signup(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(mockValidateMessage);
    });

    it('should create a new user and return 201 if successful', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
      });
      (matchedData as jest.Mock).mockReturnValue(mockValidatedData);
      (authService.signup as jest.Mock).mockResolvedValue({
        id: 1,
        ...mockValidatedData,
        createdAt: new Date(),
      });

      await authController.signup(requestMock, responseMock, nextFuncMock);

      expect(authService.signup).toHaveBeenCalledWith(mockValidatedData);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Created);
      expect(responseMock.json).toHaveBeenCalledWith({
        id: 1,
        ...mockValidatedData,
        createdAt: expect.any(Date),
      });
    });

    it('should call next with error if throw an error', async () => {
      const error = new Error('Signup failed');

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
      });

      (matchedData as jest.Mock).mockReturnValue({});
      (authService.signup as jest.Mock).mockRejectedValue(error);

      await authController.signup(requestMock, responseMock, nextFuncMock);

      expect(authService.signup).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(error);
      expect(responseMock.status).not.toHaveBeenCalled();
      expect(responseMock.json).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return 400 with validation errors if validation fails', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([mockValidateMessage]),
      });

      await authController.login(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(mockValidateMessage);
    });

    it('should return a token and 200 if successful', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
      });
      (matchedData as jest.Mock).mockReturnValue(mockValidatedData);
      (authService.login as jest.Mock).mockResolvedValue(mockAccessToken);

      await authController.login(requestMock, responseMock, nextFuncMock);

      expect(authService.login).toHaveBeenCalledWith(mockValidatedData);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith(mockAccessToken);
      expect(nextFuncMock).not.toHaveBeenCalled();
    });

    it('should call next with error if throw an error', async () => {
      const error = new BadRequestError('Error');

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
      });
      (matchedData as jest.Mock).mockReturnValue({});
      (authService.login as jest.Mock).mockRejectedValue(error);

      await authController.login(requestMock, responseMock, nextFuncMock);

      expect(authService.login).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith(error);
      expect(responseMock.status).not.toHaveBeenCalled();
      expect(responseMock.json).not.toHaveBeenCalled();
    });
  });
});
