import { Request } from 'express';
import { validationResult } from 'express-validator';
import {
  validateSignupMiddleware,
  validateLoginMiddleware,
} from '@src/validators/auth.validator';
import { execMiddlewares } from '@tests/helpers/execute-middleware.helper';
import { getRequestMock, getResponseMock } from '@tests/_mocks_/server-mock';

describe('Auth validator', () => {
  const responseMock = getResponseMock();
  let requestMock: Request;

  beforeEach(() => {
    requestMock = getRequestMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateSignupMiddleware', () => {
    it('should pass validation for correct input', async () => {
      // Arrange
      const mockBody = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      requestMock.body = mockBody;

      // Act
      await execMiddlewares(
        requestMock,
        responseMock,
        validateSignupMiddleware,
      );
      const errors = validationResult(requestMock);

      // Assert
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation for missing fields', async () => {
      // Arrange
      const mockBody = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      };
      requestMock.body = mockBody;

      // Act
      await execMiddlewares(
        requestMock,
        responseMock,
        validateSignupMiddleware,
      );
      const errors = validationResult(requestMock);

      // Assert
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Invalid email address' }),
          expect.objectContaining({
            msg: 'Password must be at least 6 characters long',
          }),
          expect.objectContaining({ msg: 'First name is required' }),
          expect.objectContaining({ msg: 'Last name is required' }),
        ]),
      );
    });
  });

  describe('validateLoginMiddleware', () => {
    it('should pass validation for correct input', async () => {
      // Arrange
      const mockBody = {
        email: 'test@example.com',
        password: 'password123',
      };
      requestMock.body = mockBody;

      // Act
      await execMiddlewares(requestMock, responseMock, validateLoginMiddleware);
      const errors = validationResult(requestMock);

      // Assert
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation for missing fields', async () => {
      // Arrange
      const mockBody = {
        email: '',
        password: '',
      };
      requestMock.body = mockBody;

      // Act
      await execMiddlewares(requestMock, responseMock, validateLoginMiddleware);
      const errors = validationResult(requestMock);

      // Assert
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Invalid email address' }),
          expect.objectContaining({
            msg: 'Password is required',
          }),
        ]),
      );
    });
  });
});
