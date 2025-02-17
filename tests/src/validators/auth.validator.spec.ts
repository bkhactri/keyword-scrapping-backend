import { validationResult } from 'express-validator';
import {
  validateSignupMiddleware,
  validateLoginMiddleware,
} from '@src/validators/auth.validator';
import { execMiddlewares } from '@tests/helpers/execute-middleware.helper';
import { requestMock, responseMock } from '@tests/_mocks_/server-mock';

describe('Auth validator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateSignupMiddleware', () => {
    it('should pass validation for correct input', async () => {
      const reqMock = { ...requestMock };
      const mockBody = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      reqMock.body = mockBody;

      await execMiddlewares(reqMock, responseMock, validateSignupMiddleware);

      const errors = validationResult(reqMock);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation for missing fields', async () => {
      const reqMock = { ...requestMock };
      const mockBody = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      };
      reqMock.body = mockBody;

      await execMiddlewares(reqMock, responseMock, validateSignupMiddleware);

      const errors = validationResult(reqMock);
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
      const reqMock = { ...requestMock };
      const mockBody = {
        email: 'test@example.com',
        password: 'password123',
      };
      reqMock.body = mockBody;

      await execMiddlewares(reqMock, responseMock, validateLoginMiddleware);

      const errors = validationResult(reqMock);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail validation for missing fields', async () => {
      const reqMock = { ...requestMock };
      const mockBody = {
        email: '',
        password: '',
      };
      reqMock.body = mockBody;

      await execMiddlewares(reqMock, responseMock, validateLoginMiddleware);

      const errors = validationResult(reqMock);
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
