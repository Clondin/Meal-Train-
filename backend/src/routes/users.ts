import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

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
    const trains = await prisma.mealTrain.findMany({
      where: { organizerId: req.user!.id },
      include: {
        dates: {
          include: {
            participants: true,
          },
        },
        taskSlots: {
          include: {
            contributions: true,
          },
        },
        contributions: true,
        _count: {
          select: {
            donations: true,
            participants: true,
            contributions: true,
            taskSlots: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ trains });
  })
);

// Get user's participations
router.get(
  '/contributions',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const contributions = await prisma.contribution.findMany({
      where: { userId: req.user!.id },
      include: contributionInclude,
      orderBy: [{ slot: { date: 'desc' } }, { createdAt: 'desc' }],
    });

    res.json({ contributions });
  })
);

// Get user's participations
router.get(
  '/participations',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const participations = await prisma.contribution.findMany({
      where: { userId: req.user!.id },
      include: contributionInclude,
      orderBy: [{ slot: { date: 'desc' } }, { createdAt: 'desc' }],
    });

    res.json({ participations });
  })
);

// Get user's donations
router.get(
  '/donations',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const donations = await prisma.donation.findMany({
      where: { userId: req.user!.id },
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
    });

    res.json({ donations });
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
      // Anonymize participations instead of deleting
      prisma.participant.updateMany({
        where: { userId },
        data: {
          userId: null,
          guestName: 'Deleted User',
          guestEmail: null,
          guestPhone: null,
        },
      }),
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
