import {
  UserAttributes,
  UserConnectionAttributes,
  UserConnectionCreationPayload,
  UserSignInPayload,
  UserSignUpPayload,
  UserTokenPayload,
} from '@src/interfaces/user.interface';
import { UserDto } from '@src/dtos/user.dto';
import { mockSocketId } from './context-mock';

export const mockAccessToken: string = 'mock-access-token';
export const mockUserId: string = '9b029d2c-a983-4dae-bd82-58b173c864a3';

export const mockUserTokenPayload: UserTokenPayload = {
  id: mockUserId,
  email: 'test@example.com',
  firstName: 'mock-first-name',
  lastName: 'mock-last-name',
};

export const mockUserDto: UserDto = {
  ...mockUserTokenPayload,
  createdAt: new Date('2024-12-13 07:55:17.615+00'),
  updatedAt: new Date('2024-12-13 07:55:17.615+00'),
};

export const mockUserDtoWithAccessToken: UserDto = {
  ...mockUserDto,
  accessToken: 'mock-access-token',
};

export const mockUserSignUpPayload: UserSignUpPayload = {
  email: 'test@example.com',
  password: 'password',
  firstName: 'mock-first-name',
  lastName: 'mock-last-name',
};

export const mockUserSignInPayload: UserSignInPayload = {
  email: 'test@example.com',
  password: 'password',
};

export const mockUserAttributes: UserAttributes = {
  ...mockUserDto,
  passwordHash: 'mock-password-hash',
};

export const mockUserConnectionCreatePayload: UserConnectionCreationPayload = {
  userId: mockUserId,
  socketId: mockSocketId,
};

export const mockUserConnectionAttributes: UserConnectionAttributes = {
  id: 1,
  ...mockUserConnectionCreatePayload,
};
