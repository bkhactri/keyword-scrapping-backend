import jwt from 'jsonwebtoken';
import authMiddleware from '@src/middlewares/auth.middleware';
import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';

jest.mock('jsonwebtoken');

describe('Auth middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next with UnauthorizedError if no authorization header is provided', async () => {
    await authMiddleware(requestMock, responseMock, nextFuncMock);
    expect(nextFuncMock).toHaveBeenCalledWith(expect.any(Error));
    expect(nextFuncMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'No token provided' }),
    );
  });

  it('should call next with UnauthorizedError if token is invalid (jwt.verify throws error)', async () => {
    requestMock.headers = { authorization: 'Bearer invalid-token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    await authMiddleware(requestMock, responseMock, nextFuncMock);

    expect(nextFuncMock).toHaveBeenCalledWith(expect.any(Error));
    expect(nextFuncMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid token' }),
    );
  });

  it('should call next with UnauthorizedError if token is invalid (jwt.verify return null)', async () => {
    requestMock.headers = { authorization: 'Bearer invalid-token' };
    (jwt.verify as jest.Mock).mockReturnValue(null);

    await authMiddleware(requestMock, responseMock, nextFuncMock);

    expect(nextFuncMock).toHaveBeenCalledWith(expect.any(Error));
    expect(nextFuncMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid token' }),
    );
  });

  it('should call next if token is valid', async () => {
    const mockDecodedToken = { userId: 1, email: 'test@example.com' };
    requestMock.headers = { authorization: 'Bearer valid-token' };
    (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

    await authMiddleware(requestMock, responseMock, nextFuncMock);

    expect(jwt.verify).toHaveBeenCalledWith(
      'valid-token',
      process.env.JWT_SECRET,
    );
    expect(nextFuncMock).toHaveBeenCalled();
  });
});
