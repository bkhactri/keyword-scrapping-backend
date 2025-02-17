import express from 'express';
import fs from 'fs';
import path from 'path';
import supertest from 'supertest';
import createServer from '@src/server';
import jwt from 'jsonwebtoken';

import multer from 'multer';
import { fileUploadMiddleware } from '@src/middlewares/file-upload.middleware';
import * as keywordService from '@src/services/keyword.service';
import { mockUser } from '@tests/_mocks_/context-mock';
import { KeywordStatus } from '@src/enums/keyword.enum';

jest.mock('bullmq');
jest.mock('ioredis');
jest.mock('@src/services/keyword.service');

describe('File upload middleware', () => {
  describe('fileUploadMiddleware', () => {
    let app: express.Application;
    const token = jwt.sign(mockUser, process.env.JWT_SECRET);

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
      await supertest(app)
        .post('/api/v1/upload')
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual('Please upload a CSV file');
        });
    });

    it('should call next if file size is within the limit', async () => {
      (keywordService.createBulk as jest.Mock).mockResolvedValue([
        {
          id: 1,
          userId: mockUser.id,
          keyword: 'keyword1',
          status: KeywordStatus.Pending,
        },
        {
          id: 2,
          userId: mockUser.id,
          keyword: 'keyword2',
          status: KeywordStatus.Pending,
        },
        {
          id: 3,
          userId: mockUser.id,
          keyword: 'keyword3',
          status: KeywordStatus.Pending,
        },
      ]);

      const csvContent = 'Keyword\nkeyword1\nkeyword2\nkeyword3';
      const filePath = path.join(__dirname, 'test.csv');
      fs.writeFileSync(filePath, csvContent);

      await supertest(app)
        .post('/api/v1/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', filePath)
        .expect(200);

      fs.unlinkSync(filePath);
    });
  });
});
