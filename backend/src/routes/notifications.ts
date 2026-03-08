import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('read').optional().isBoolean().toBoolean(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const readFilter = req.query.read;
    const parsedRead =
      readFilter === undefined
        ? undefined
        : readFilter === 'true';

    const where = {
      userId: req.user!.id,
      ...(parsedRead !== undefined ? { read: parsedRead } : {}),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

router.get(
  '/unread-count',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const count = await prisma.notification.count({
      where: {
        userId: req.user!.id,
        read: false,
      },
    });

    res.json({ count });
  })
);

router.patch(
  '/:id/read',
  authenticate,
  [param('id').isString()],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { read: true },
    });

    res.json({ notification: updated });
  })
);

router.post(
  '/read-all',
  authenticate,
  [body().optional()],
  catchAsync(async (req: AuthRequest, res: Response) => {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({ message: 'All notifications marked as read' });
  })
);

export default router;
