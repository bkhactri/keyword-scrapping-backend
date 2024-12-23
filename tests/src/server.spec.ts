import express from 'express';
import request from 'supertest';
import createServer from '@src/server';

jest.mock('bullmq');
jest.mock('ioredis');

describe('createServer', () => {
  let app: express.Application;

  beforeAll(async () => {
    const server = await createServer();
    app = server.app;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should configure CORS middleware', async () => {
    // Act
    const response = await request(app).options('/');

    // Assert
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('should configure Helmet middleware', async () => {
    // Act
    const response = await request(app).get('/');

    // Assert
    expect(response.headers['x-dns-prefetch-control']).toBe('off');
  });

  it('should configure bodyParser middleware for JSON', async () => {
    // Arrange
    const payload = { key: 'value' };

    // Act
    const response = await request(app).post('/').send(payload);

    // Assert
    expect(response.status).toBe(404);
  });

  it('should configure bodyParser middleware for URL-encoded data', async () => {
    // Arrange
    const payload = 'key=value';

    // Act
    const response = await request(app)
      .post('/')
      .send(payload)
      .set('Content-Type', 'application/x-www-form-urlencoded');

    // Assert
    expect(response.status).toBe(404);
  });

  it('should use health router', async () => {
    // Act
    const response = await request(app).get('/api/v1/health');

    // Assert
    expect(response.status).toBe(200);
    expect(response.text).toBe(`${process.env.SERVICE_NAME} is ok`);
  });
});
