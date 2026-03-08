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
  taskSlot: {
    findMany: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../config/database.js', () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));

import app from '../index.js';

describe('task slot routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates task slots in bulk for an organizer', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'organizer@example.com',
      emailVerified: true,
    });
    mockPrisma.mealTrain.findFirst.mockResolvedValue({
      id: 'train-1',
      slug: 'train-1',
      organizerId: 'user-1',
      admins: [],
    });
    mockPrisma.$transaction.mockImplementation(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations)
    );
    mockPrisma.taskSlot.upsert
      .mockResolvedValueOnce({ id: 'slot-1', taskType: 'MEAL_DINNER' })
      .mockResolvedValueOnce({ id: 'slot-2', taskType: 'RIDES' });

    const token = jwt.sign({ userId: 'user-1' }, process.env.JWT_SECRET || 'fallback-secret');

    const response = await request(app)
      .post('/api/chesed-trains/train-1/task-slots/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        slots: [
          { date: '2026-03-10', taskType: 'MEAL_DINNER', maxContributors: 1 },
          { date: '2026-03-11', taskType: 'RIDES', maxContributors: 2, location: 'Lakewood' },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.taskSlots).toHaveLength(2);
    expect(mockPrisma.taskSlot.upsert).toHaveBeenCalledTimes(2);
    expect(mockPrisma.taskSlot.upsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          trainId_date_taskType: {
            trainId: 'train-1',
            date: new Date('2026-03-11'),
            taskType: 'RIDES',
          },
        },
      })
    );
  });

  it('filters task slots by date and task type', async () => {
    mockPrisma.mealTrain.findFirst.mockResolvedValue({
      id: 'train-1',
      slug: 'train-1',
      organizerId: 'user-1',
      admins: [],
      isPublic: true,
    });
    mockPrisma.taskSlot.findMany.mockResolvedValue([]);
    mockPrisma.taskSlot.count.mockResolvedValue(0);

    const response = await request(app).get(
      '/api/chesed-trains/train-1/task-slots?date=2026-03-09&taskType=RIDES'
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.taskSlot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          trainId: 'train-1',
          date: new Date('2026-03-09'),
          taskType: 'RIDES',
        },
      })
    );
  });
});
