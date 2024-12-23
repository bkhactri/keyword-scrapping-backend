import express from 'express';
import fs from 'fs';
import path from 'path';
import supertest from 'supertest';
import createServer from '@src/server';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { fileUploadMiddleware } from '@src/middlewares/file-upload.middleware';
import * as keywordService from '@src/services/keyword.service';
import { mockUserTokenPayload } from '@tests/_mocks_/user-mock';
import { mockKeywordDto } from '@tests/_mocks_/keyword-mock';

jest.mock('bullmq');
jest.mock('ioredis');
jest.mock('@src/services/keyword.service');

describe('File upload middleware', () => {
  describe('fileUploadMiddleware', () => {
    let app: express.Application;
    const mockAccessToken = jwt.sign(
      mockUserTokenPayload,
      process.env.JWT_SECRET,
    );

    beforeAll(async () => {
      const server = await createServer();
      app = server.app;
    });

    beforeEach(() => {
      app.use(
        multer({
          storage: multer.memoryStorage(),
          limits: { fileSize: 1 * 1024 * 1024 },
        }).single('file'),
      );

      app.use(fileUploadMiddleware);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call next if no file is uploaded', async () => {
      // Arrange -> skip due to unnecessary

      // Act
      const result = await supertest(app)
        .post('/api/v1/upload')
        .set('Authorization', `Bearer ${mockAccessToken}`);

      // Assert
      expect(result.status).toEqual(400);
      expect(result.body.message).toEqual('Please upload a CSV file');
    });

    it('should call next if file size is within the limit', async () => {
      // Arrange
      (keywordService.createBulk as jest.Mock).mockResolvedValue([
        mockKeywordDto,
      ]);
      const csvContent = 'Keyword\nmock-keyword';
      const filePath = path.join(__dirname, 'test.csv');
      fs.writeFileSync(filePath, csvContent);

      // Act
      const result = await supertest(app)
        .post('/api/v1/upload')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .attach('file', filePath);

      // Assert
      expect(result.status).toEqual(200);

      // Cleanup
      fs.unlinkSync(filePath);
    });
  });
});
