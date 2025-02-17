import { Request, Response, NextFunction } from 'express';

export const requestMock = {
  headers: {},
  query: {},
  params: {},
  body: {},
} as unknown as Request;

export const responseMock = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
} as unknown as Response;

export const nextFuncMock: NextFunction = jest.fn();
