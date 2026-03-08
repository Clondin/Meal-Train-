import request from 'supertest';
import app from '../index.js';

describe('app', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/definitely-not-a-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Not found' });
  });
});
