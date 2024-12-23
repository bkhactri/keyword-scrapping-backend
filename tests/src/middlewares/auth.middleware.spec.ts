import jwt from 'jsonwebtoken';
import authMiddleware from '@src/middlewares/auth.middleware';
import {
  getRequestMock,
  getResponseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import { mockUserTokenPayload } from '@tests/_mocks_/user-mock';

describe('Auth middleware', () => {
  const requestMock = getRequestMock();
  const responseMock = getResponseMock();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next with UnauthorizedError if no authorization header is provided', async () => {
    // Act
    await authMiddleware(requestMock, responseMock, nextFuncMock);

    // Assert
    expect(nextFuncMock).toHaveBeenCalledWith(expect.any(Error));
    expect(nextFuncMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'No token provided' }),
    );
  });

  it('should call next with UnauthorizedError if token is invalid (jwt.verify throws error)', async () => {
    // Arrange
    requestMock.headers = { authorization: 'Bearer invalid-token' };

    // Act
    await authMiddleware(requestMock, responseMock, nextFuncMock);

    // Assert
    expect(nextFuncMock).toHaveBeenCalledWith(expect.any(Error));
    expect(nextFuncMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid token' }),
    );
  });

  it('should call next with UnauthorizedError if token is invalid (jwt.verify return null)', async () => {
    // Arrange
    requestMock.headers = { authorization: 'Bearer invalid-token' };

    // Act
    await authMiddleware(requestMock, responseMock, nextFuncMock);

    // Assert
    expect(nextFuncMock).toHaveBeenCalledWith(expect.any(Error));
    expect(nextFuncMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid token' }),
    );
  });

  it('should call next if token is valid', async () => {
    // Arrange
    const mockAccessToken = jwt.sign(
      mockUserTokenPayload,
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRED_TIME },
    );
    requestMock.headers = { authorization: `Bearer ${mockAccessToken}` };

    // Act
    await authMiddleware(requestMock, responseMock, nextFuncMock);

    // Assert
    expect(requestMock.user).toMatchObject(mockUserTokenPayload);
    expect(nextFuncMock).toHaveBeenCalled();
  });
});
