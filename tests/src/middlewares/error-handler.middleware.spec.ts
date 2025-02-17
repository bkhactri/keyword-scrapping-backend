import { validationResult } from 'express-validator';
import { AppError, BadRequestError } from '@src/utils/error.util';
import {
  errorHandler,
  expressValidatorErrorHandler,
} from '@src/middlewares/error-handler.middleware';
import {
  getRequestMock,
  getResponseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import { HttpStatus } from '@src/enums/http-status.enum';

jest.mock('express-validator');

describe('Error handler middleware', () => {
  const requestMock = getRequestMock();
  const responseMock = getResponseMock();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      // Arrange
      const message = 'Test AppError';
      const details = { field: 'email', message: 'invalid' };
      const err = new AppError(message, HttpStatus.BadRequest, true, details);

      // Act
      errorHandler(err, requestMock, responseMock, nextFuncMock);

      // Assert
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.BadRequest);
      expect(responseMock.json).toHaveBeenCalledWith({
        message,
        details,
      });
    });

    it('should handle AppError without details', () => {
      // Arrange
      const message = 'Test AppError without details';
      const err = new AppError(message, HttpStatus.InternalServerError, true);

      // Act
      errorHandler(err, requestMock, responseMock, nextFuncMock);

      // Assert
      expect(responseMock.status).toHaveBeenCalledWith(
        HttpStatus.InternalServerError,
      );
      expect(responseMock.json).toHaveBeenCalledWith({
        message,
        details: undefined,
      });
    });

    it('should handle BadRequestError correctly', () => {
      // Arrange
      const message = 'Bad Request';
      const details = { errors: [{ message: 'some error' }] };
      const err = new BadRequestError(message, details);

      // Act
      errorHandler(err, requestMock, responseMock, nextFuncMock);

      // Assert
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.BadRequest);
      expect(responseMock.json).toHaveBeenCalledWith({
        message,
        details,
      });
    });

    it('should handle generic Error correctly', () => {
      // Arrange
      const err = new Error('Generic error');

      // Act
      errorHandler(err, requestMock, responseMock, nextFuncMock);

      // Assert
      expect(responseMock.status).toHaveBeenCalledWith(
        HttpStatus.InternalServerError,
      );
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'Generic error',
      });
    });

    it('should handle JSON SyntaxError correctly', () => {
      // Arrange
      const err = new SyntaxError('Unexpected token o in JSON at position 1');

      // Act
      errorHandler(err, requestMock, responseMock, nextFuncMock);

      // Assert
      expect(responseMock.status).toHaveBeenCalledWith(
        HttpStatus.InternalServerError,
      );
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'Unexpected token o in JSON at position 1',
      });
    });

    it('should throw default error message correctly', () => {
      // Arrange
      const err = Error();

      // Act
      errorHandler(err, requestMock, responseMock, nextFuncMock);

      // Assert
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
      // Arrange
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
      });

      // Act
      expressValidatorErrorHandler(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(nextFuncMock).toHaveBeenCalledTimes(1);
    });

    it('should call next with error object if validation errors', () => {
      // Arrange
      const mockError = {
        type: 'invalid_value',
        msg: 'Invalid value',
      };

      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([mockError]),
      });

      // Act
      expressValidatorErrorHandler(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(nextFuncMock).toHaveBeenCalledWith({
        type: mockError.type,
        message: mockError.msg,
      });
    });
  });
});
