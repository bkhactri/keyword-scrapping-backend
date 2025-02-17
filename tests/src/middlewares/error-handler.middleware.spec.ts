import { AppError, BadRequestError } from '@src/utils/error.util';
import errorHandler from '@src/middlewares/error-handler.middleware';
import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';

describe('Error handler middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle AppError correctly', () => {
    const message = 'Test AppError';
    const statusCode = 400;
    const details = { field: 'email', message: 'invalid' };
    const err = new AppError(message, statusCode, true, details);

    errorHandler(err, requestMock, responseMock, nextFuncMock);

    expect(responseMock.status).toHaveBeenCalledWith(statusCode);
    expect(responseMock.json).toHaveBeenCalledWith({
      message,
      details,
    });
  });

  it('should handle AppError without details', () => {
    const message = 'Test AppError without details';
    const statusCode = 500;
    const err = new AppError(message, statusCode, true);

    errorHandler(err, requestMock, responseMock, nextFuncMock);

    expect(responseMock.status).toHaveBeenCalledWith(statusCode);
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

    expect(responseMock.status).toHaveBeenCalledWith(400);
    expect(responseMock.json).toHaveBeenCalledWith({
      message,
      details,
    });
  });

  it('should handle generic Error correctly', () => {
    const err = new Error('Generic error');

    errorHandler(err, requestMock, responseMock, nextFuncMock);

    expect(responseMock.status).toHaveBeenCalledWith(500);
    expect(responseMock.json).toHaveBeenCalledWith({
      message: 'Generic error',
    });
  });

  it('should handle JSON SyntaxError correctly', () => {
    const err = new SyntaxError('Unexpected token o in JSON at position 1');

    errorHandler(err, requestMock, responseMock, nextFuncMock);

    expect(responseMock.status).toHaveBeenCalledWith(500);
    expect(responseMock.json).toHaveBeenCalledWith({
      message: 'Unexpected token o in JSON at position 1',
    });
  });

  it('should throw default error message correctly', () => {
    const err = Error();

    errorHandler(err, requestMock, responseMock, nextFuncMock);

    expect(responseMock.status).toHaveBeenCalledWith(500);
    expect(responseMock.json).toHaveBeenCalledWith({
      message: 'Something went wrong!',
    });
  });
});
