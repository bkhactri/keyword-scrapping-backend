import { validationResult } from 'express-validator';
import { AppError, BadRequestError } from '@src/utils/error.util';
import {
  errorHandler,
  expressValidatorErrorHandler,
} from '@src/middlewares/error-handler.middleware';
import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import { HttpStatus } from '@src/enums/http-status.enum';

jest.mock('express-validator');

describe('Error handler middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const message = 'Test AppError';
      const details = { field: 'email', message: 'invalid' };
      const err = new AppError(message, HttpStatus.BadRequest, true, details);

      errorHandler(err, requestMock, responseMock, nextFuncMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.BadRequest);
      expect(responseMock.json).toHaveBeenCalledWith({
        message,
        details,
      });
    });

    it('should handle AppError without details', () => {
      const message = 'Test AppError without details';
      const err = new AppError(message, HttpStatus.InternalServerError, true);

      errorHandler(err, requestMock, responseMock, nextFuncMock);

      expect(responseMock.status).toHaveBeenCalledWith(
        HttpStatus.InternalServerError,
      );
      expect(responseMock.json).toHaveBeenCalledWith({
        message,
        details: undefined,
      });
    });

    it('should handle BadRequestError correctly', () => {
      const message = 'Bad Request';
      const details = { errors: [{ message: 'some error' }] };
      const err = new BadRequestError(message, details);

      errorHandler(err, requestMock, responseMock, nextFuncMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.BadRequest);
      expect(responseMock.json).toHaveBeenCalledWith({
        message,
        details,
      });
    });

    it('should handle generic Error correctly', () => {
      const err = new Error('Generic error');

      errorHandler(err, requestMock, responseMock, nextFuncMock);

      expect(responseMock.status).toHaveBeenCalledWith(
        HttpStatus.InternalServerError,
      );
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'Generic error',
      });
    });

    it('should handle JSON SyntaxError correctly', () => {
      const err = new SyntaxError('Unexpected token o in JSON at position 1');

      errorHandler(err, requestMock, responseMock, nextFuncMock);

      expect(responseMock.status).toHaveBeenCalledWith(
        HttpStatus.InternalServerError,
      );
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'Unexpected token o in JSON at position 1',
      });
    });

    it('should throw default error message correctly', () => {
      const err = Error();

      errorHandler(err, requestMock, responseMock, nextFuncMock);

      expect(responseMock.status).toHaveBeenCalledWith(
        HttpStatus.InternalServerError,
      );
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'Something went wrong!',
      });
    });
  });

  describe('expressValidatorErrorHandler', () => {
    it('should call next if no validation errors', () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
      });

      expressValidatorErrorHandler(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalledTimes(1);
    });

    it('should call next with error object if validation errors', () => {
      const mockError = {
        type: 'invalid_value',
        msg: 'Invalid value',
      };

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([mockError]),
      });

      expressValidatorErrorHandler(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalledWith({
        type: mockError.type,
        message: mockError.msg,
      });
    });
  });
});
