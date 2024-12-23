import { Request } from 'express';
import { getRequestMock, getResponseMock } from '@tests/_mocks_/server-mock';
import { HttpStatus } from '@src/enums/http-status.enum';
import * as healthController from '@src/controllers/health.controller';

describe('Health Controller', () => {
  describe('healthCheck', () => {
    const requestMock = getRequestMock();
    const responseMock = getResponseMock();

    it('should response with status 200 ok', async () => {
      // Arrange - skip due to unnecessary

      // Act
      healthController.healthCheck(
        {
          ...requestMock,
        } as unknown as Request,
        responseMock,
      );

      // Assert
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.Ok);
    });
  });
});
