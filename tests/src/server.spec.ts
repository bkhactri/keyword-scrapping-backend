import express from 'express';
import request from 'supertest';
import createServer from '@src/server';

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
    const response = await request(app).options('/');

    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('should configure Helmet middleware', async () => {
    const response = await request(app).get('/');

    expect(response.headers['x-dns-prefetch-control']).toBe('off');
  });

  it('should configure bodyParser middleware for JSON', async () => {
    const payload = { key: 'value' };
    const response = await request(app).post('/').send(payload);

    expect(response.status).toBe(404);
  });

  it('should configure bodyParser middleware for URL-encoded data', async () => {
    const payload = 'key=value';
    const response = await request(app)
      .post('/')
      .send(payload)
      .set('Content-Type', 'application/x-www-form-urlencoded');

    expect(response.status).toBe(404);
  });

  it('should use health router', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.text).toBe(`${process.env.SERVICE_NAME} is ok`);
  });
});
