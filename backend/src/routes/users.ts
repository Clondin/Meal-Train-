import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

const router = Router();

const contributionInclude = {
  train: {
    select: {
      id: true,
      slug: true,
      title: true,
      recipientName: true,
      recipientAddress: true,
      recipientCity: true,
      recipientState: true,
      recipientZip: true,
    },
  },
  slot: true,
  thankYouNotes: {
    include: {
      recipientUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  },
} as const;

// Get user profile
router.get(
  '/profile',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        timezone: true,
        emailVerified: true,
        createdAt: true,
        oauthProviders: {
          select: { provider: true },
        },
      },
    });

    res.json({ user });
  })
);

// Update user profile
router.patch(
  '/profile',
  authenticate,
  [
    body('firstName').optional().trim().isLength({ max: 100 }),
    body('lastName').optional().trim().isLength({ max: 100 }),
    body('phone').optional().trim().isLength({ max: 20 }),
    body('timezone').optional().trim(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { firstName, lastName, phone, timezone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(timezone !== undefined && { timezone }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        timezone: true,
        emailVerified: true,
      },
    });

    res.json({ user });
  })
);

// Change password
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user?.password) {
      throw new AppError('Cannot change password for OAuth-only accounts', 400);
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  })
);

// Get user's meal trains (organized)
router.get(
  '/trains',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const pagination = parsePagination(req.query);
    const where = { organizerId: req.user!.id };
    const [trains, total] = await Promise.all([
      prisma.mealTrain.findMany({
        where,
        include: {
          taskSlots: {
            include: {
              contributions: true,
            },
          },
          contributions: true,
          _count: {
            select: {
              donations: true,
              contributions: true,
              taskSlots: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.mealTrain.count({ where }),
    ]);

    res.json({
      data: trains,
      pagination: buildPaginationMeta(pagination, total),
    });
  })
);

router.get(
  '/dashboard-stats',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const [
      totalTrains,
      activeTrains,
      totalContributions,
      totalDonationsAmount,
      upcomingDeliveries,
    ] = await Promise.all([
      prisma.mealTrain.count({
        where: { organizerId: req.user!.id },
      }),
      prisma.mealTrain.count({
        where: {
          organizerId: req.user!.id,
          status: 'ACTIVE',
          endDate: { gte: now },
        },
      }),
      prisma.contribution.count({
        where: {
          train: { organizerId: req.user!.id },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      }),
      prisma.donation.aggregate({
        where: {
          train: { organizerId: req.user!.id },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.taskSlot.findMany({
        where: {
          train: { organizerId: req.user!.id },
          date: { gte: now },
          status: { in: ['FILLED', 'PARTIALLY_FILLED'] },
        },
        include: {
          train: {
            select: {
              id: true,
              slug: true,
              title: true,
              recipientName: true,
            },
          },
          contributions: {
            where: {
              status: { in: ['CONFIRMED', 'PENDING'] },
            },
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
        take: 5,
      }),
    ]);

    res.json({
      totalTrains,
      activeTrains,
      totalContributions,
      totalDonationsAmount: Number(totalDonationsAmount._sum.amount || 0),
      upcomingDeliveries,
    });
  })
);

// Get user's participations
router.get(
  '/contributions',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const pagination = parsePagination(req.query);
    const where = { userId: req.user!.id };
    const [contributions, total] = await Promise.all([
      prisma.contribution.findMany({
        where,
        include: contributionInclude,
        orderBy: [{ slot: { date: 'desc' } }, { createdAt: 'desc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.contribution.count({ where }),
    ]);

    res.json({
      data: contributions,
      pagination: buildPaginationMeta(pagination, total),
    });
  })
);

// Get user's participations
router.get(
  '/participations',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const pagination = parsePagination(req.query);
    const where = { userId: req.user!.id };
    const [participations, total] = await Promise.all([
      prisma.contribution.findMany({
        where,
        include: contributionInclude,
        orderBy: [{ slot: { date: 'desc' } }, { createdAt: 'desc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.contribution.count({ where }),
    ]);

    res.json({
      data: participations,
      pagination: buildPaginationMeta(pagination, total),
    });
  })
);

// Get user's donations
router.get(
  '/donations',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const pagination = parsePagination(req.query);
    const where = { userId: req.user!.id };
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          train: {
            select: {
              id: true,
              slug: true,
              title: true,
              recipientName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.donation.count({ where }),
    ]);

    res.json({
      data: donations,
      pagination: buildPaginationMeta(pagination, total),
    });
  })
);

// Delete account (GDPR)
router.delete(
  '/account',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // Delete all user data
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId } }),
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.thankYouNote.deleteMany({ where: { recipientUserId: userId } }),
      prisma.oAuthProvider.deleteMany({ where: { userId } }),
      prisma.contribution.updateMany({
        where: { userId },
        data: {
          userId: null,
          guestName: 'Deleted User',
          guestEmail: null,
          guestPhone: null,
        },
      }),
      // Anonymize donations
      prisma.donation.updateMany({
        where: { userId },
        data: {
          userId: null,
          donorName: 'Anonymous',
          donorEmail: 'deleted@mealtrain.com',
          isAnonymous: true,
        },
      }),
      // Delete user
      prisma.user.delete({ where: { id: userId } }),
    ]);

    res.json({ message: 'Account deleted successfully' });
  })
);

export default router;
