import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const mockPrisma: any = {
  user: {
    findUnique: jest.fn(),
  },
  mealTrain: {
    findFirst: jest.fn(),
  },
};

jest.mock('../config/database.js', () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));

import app from '../index.js';

describe('security regressions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects anonymous access to a private train', async () => {
    mockPrisma.mealTrain.findFirst.mockResolvedValue({
      id: 'train-1',
      slug: 'private-train',
      organizerId: 'user-1',
      admins: [],
      isPublic: false,
      allowDonations: false,
      taskSlots: [],
      contributions: [],
      simchaContributions: [],
      _count: {},
    });

    const response = await request(app).get('/api/chesed-trains/private-train');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Not authorized');
  });

  it('rejects anonymous task slot creation', async () => {
    const response = await request(app)
      .post('/api/chesed-trains/private-train/task-slots')
      .send({
        date: '2026-03-12',
        taskType: 'MEAL_DINNER',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authentication required');
  });

  it('allows organizers to access private trains', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'organizer@example.com',
      emailVerified: true,
    });
    mockPrisma.mealTrain.findFirst.mockResolvedValue({
      id: 'train-1',
      slug: 'private-train',
      organizerId: 'user-1',
      admins: [],
      isPublic: false,
      allowDonations: false,
      taskSlots: [],
      contributions: [],
      simchaContributions: [],
      _count: {},
    });

    const token = jwt.sign({ userId: 'user-1' }, process.env.JWT_SECRET!);
    const response = await request(app)
      .get('/api/chesed-trains/private-train')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.train.slug).toBe('private-train');
  });
});
