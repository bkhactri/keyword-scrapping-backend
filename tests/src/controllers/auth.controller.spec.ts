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

jest.mock('express-validator');
jest.mock('@src/services/auth.service');

describe('Auth controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should return 400 with validation errors if validation fails', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Email is required' }]),
      });

      await authController.signup(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith({ msg: 'Email is required' });
    });

    it('should create a new user and return 201 if successful', async () => {
      const validatedData = {
        email: 'test@example.com',
        passwordHash: 'password',
      };

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
      });
      (matchedData as jest.Mock).mockReturnValue(validatedData);
      (authService.signup as jest.Mock).mockResolvedValue({
        id: 1,
        ...validatedData,
        createdAt: new Date(),
      });

      await authController.signup(requestMock, responseMock, nextFuncMock);

      expect(authService.signup).toHaveBeenCalledWith(validatedData);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Created);
      expect(responseMock.json).toHaveBeenCalledWith({
        id: 1,
        ...validatedData,
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
        array: jest.fn().mockReturnValue([{ msg: 'Email is required' }]),
      });

      await authController.login(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalled();
      expect(nextFuncMock).toHaveBeenCalledWith({ msg: 'Email is required' });
    });

    it('should return a token and 200 if successful', async () => {
      const validatedData = {
        email: 'test@example.com',
        passwordHash: 'password',
      };
      const token = 'test-token';

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
      });
      (matchedData as jest.Mock).mockReturnValue(validatedData);
      (authService.login as jest.Mock).mockResolvedValue(token);

      await authController.login(requestMock, responseMock, nextFuncMock);

      expect(authService.login).toHaveBeenCalledWith(validatedData);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
      expect(responseMock.json).toHaveBeenCalledWith('test-token');
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
