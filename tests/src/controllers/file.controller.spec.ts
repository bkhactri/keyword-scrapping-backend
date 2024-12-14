import {
  requestMock,
  responseMock,
  nextFuncMock,
} from '@tests/_mocks_/server-mock';
import * as fileController from '@src/controllers/file.controller';
import { AppError } from '@/src/utils/error.util';

jest.mock('express-validator');
jest.mock('@src/services/auth.service');

describe('File controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should return 400 with validation errors if validation fails', async () => {
      await fileController.uploadFile(requestMock, responseMock, nextFuncMock);

      expect(nextFuncMock).toHaveBeenCalledWith(expect.any(AppError));
      expect(nextFuncMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please upload a CSV file' }),
      );
    });
  });
});
