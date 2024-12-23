import { Request, Response, NextFunction } from 'express';

export const getRequestMock = (): Request => {
  const requestMock = {
    headers: {},
    query: {},
    params: {},
    body: {},
  } as unknown as Request;

  return requestMock;
};

export const getResponseMock = (): Response => {
  const responseMock = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return responseMock;
};

export const nextFuncMock: NextFunction = jest.fn();
