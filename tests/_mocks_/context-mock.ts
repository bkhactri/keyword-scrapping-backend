import { KeywordStatus } from '@src/enums/keyword.enum';

export const mockKeywords = ['key1', 'key2', 'key3'];
export const mockUserId = '9b029d2c-a983-4dae-bd82-58b173c864a3';
export const mockAccessToken = 'mock-access-token';
export const mockSocketId = 'mock-socket-id';
export const mockKeywordId = 1010;

export const mockUser = {
  id: mockUserId,
  email: 'mock-user-email',
  firstName: 'mock-first-name',
  lastName: 'mock-last-name',
};

export const mockUserAttributes = {
  ...mockUser,
  passwordHash: 'mock-hashed-password',
  createdAt: new Date('2024-12-13 07:55:17.615+00'),
  updatedAt: new Date('2024-12-13 07:55:17.615+00'),
};

export const mockSearchResult = {
  keywordId: mockKeywordId,
  keyword: 'key1',
  totalAds: 1,
  totalLinks: 10,
  createdAt: new Date('2024-12-13 07:55:17.615+00'),
  updatedAt: new Date('2024-12-13 07:55:17.615+00'),
};

export const mockSearchResultWithHtmlCachePage = {
  ...mockSearchResult,
  htmlCachePage: 'sanitized_<html></html>',
};

export const userSignUpPayload = {
  email: 'test@example.com',
  password: 'password',
  firstName: 'mock-first-name',
  lastName: 'mock-last-name',
};

export const userSignInPayload = {
  email: 'test@example.com',
  password: 'password',
};

export const mockKeyword = {
  id: mockKeywordId,
  userId: mockUserId,
  keyword: 'key1',
  status: KeywordStatus.Pending,
  createdAt: new Date('2024-12-13 07:55:17.615+00'),
  updatedAt: new Date('2024-12-13 07:55:17.615+00'),
};

export const mockPagination = {
  page: 0,
  pageSize: 20,
};

export const mockUserConnection = {
  userId: mockUserId,
  socketId: mockSocketId,
};

export const mockScrapeContext = {
  userId: 'mock-user-id',
  keyword: 'key1',
  keywordId: 1,
};
