import { Request } from 'express';
import { requestMock, responseMock } from '@tests/_mocks_/server-mock';
import { HttpStatus } from '@src/enums/http-status.enum';
import * as healthController from '@src/controllers/health.controller';

describe('Health Controller', () => {
  describe('healthCheck', () => {
    it('should response with status 200 ok', async () => {
      healthController.healthCheck(
        {
          ...requestMock,
        } as unknown as Request,
        responseMock,
      );

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
    });
  });
});
