import { Request } from 'express';
import {
  getRequestMock,
  getResponseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import { validateFileTypeMiddleware } from '@src/validators/file.validator';
import { AppError } from '@src/utils/error.util';

describe('File validator', () => {
  const responseMock = getResponseMock();
  let requestMock: Request;

  beforeEach(() => {
    requestMock = getRequestMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFileTypeMiddleware', () => {
    it('should call next with AppError if file type is not CSV', () => {
      // Arrange
      requestMock.file = {
        mimetype: 'application/json',
      } as Express.Multer.File;

      // Act
      validateFileTypeMiddleware(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(nextFuncMock).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFuncMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please upload a CSV file' }),
      );
    });

    it('should call next with AppError if no file is provided', () => {
      // Arrange
      requestMock.file = undefined;

      // Act
      validateFileTypeMiddleware(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(nextFuncMock).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFuncMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please upload a CSV file' }),
      );
    });

    it('should call next without errors if file size is exceed', () => {
      // Arrange
      requestMock.file = {
        mimetype: 'text/csv',
        size: 5 * 1024 * 1024,
      } as Express.Multer.File;

      // Act
      validateFileTypeMiddleware(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(nextFuncMock).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFuncMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'File size exceeds the limit 1MB' }),
      );
    });

    it('should call next without errors if file type is valid', () => {
      // Arrange
      requestMock.file = { mimetype: 'text/csv' } as Express.Multer.File;

      // Act
      validateFileTypeMiddleware(requestMock, responseMock, nextFuncMock);

      // Assert
      expect(nextFuncMock).toHaveBeenCalledWith();
    });
  });
});
