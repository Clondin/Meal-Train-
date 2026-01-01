import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { createCheckoutSession } from '../services/stripe.js';
import { sendGiftCardNotification } from '../services/email.js';
import { generateUniqueCode } from '../utils/slug.js';
import { body, validationResult } from 'express-validator';
import { PaymentStatus } from '@prisma/client';

const router = Router();

// Supported gift card vendors
const VENDORS = ['DoorDash', 'UberEats', 'GrubHub', 'Instacart', 'Amazon'];

// Get available vendors
router.get('/vendors', (req, res) => {
  res.json({ vendors: VENDORS });
});

// Purchase gift card
router.post(
  '/',
  optionalAuth,
  [
    body('trainId').notEmpty(),
    body('amount').isFloat({ min: 10 }),
    body('vendor').isIn(VENDORS),
    body('purchaserName').trim().isLength({ min: 1 }),
    body('purchaserEmail').isEmail(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const {
      trainId,
      amount,
      vendor,
      purchaserName,
      purchaserEmail,
      message,
      successUrl,
      cancelUrl,
    } = req.body;

    // Verify train exists and allows gift cards
    const train = await prisma.mealTrain.findUnique({
      where: { id: trainId },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!train.allowGiftCards) {
      throw new AppError('This meal train does not accept gift cards', 400);
    }

    // Create gift card record
    const giftCard = await prisma.giftCard.create({
      data: {
        trainId,
        userId: req.user?.id,
        purchaserName,
        purchaserEmail,
        amount,
        vendor,
        message,
        deliveryEmail: train.recipientEmail,
        status: PaymentStatus.PENDING,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      amount: Math.round(amount * 100),
      customerEmail: purchaserEmail,
      successUrl: successUrl || `${frontendUrl}/train/${train.slug}?giftcard=success`,
      cancelUrl: cancelUrl || `${frontendUrl}/train/${train.slug}?giftcard=cancelled`,
      metadata: {
        type: 'giftcard',
        giftCardId: giftCard.id,
        trainId,
        vendor,
      },
    });

    // Update with payment session ID
    await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: { stripePaymentId: session.id },
    });

    res.json({ sessionUrl: session.url, giftCardId: giftCard.id });
  })
);

// Confirm gift card purchase (called after successful payment via webhook)
router.post(
  '/:id/confirm',
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
      include: {
        train: true,
      },
    });

    if (!giftCard) {
      throw new AppError('Gift card not found', 404);
    }

    if (giftCard.status === PaymentStatus.COMPLETED) {
      return res.json({ giftCard, message: 'Gift card already confirmed' });
    }

    // Generate gift card code
    const code = generateUniqueCode(12);

    // Update gift card status
    const updatedGiftCard = await prisma.giftCard.update({
      where: { id },
      data: {
        status: PaymentStatus.COMPLETED,
        code,
        deliveredAt: new Date(),
      },
    });

    // Send gift card to recipient
    if (giftCard.deliveryEmail) {
      await sendGiftCardNotification(
        giftCard.deliveryEmail,
        giftCard.purchaserName,
        giftCard.amount.toString(),
        giftCard.vendor,
        code,
        giftCard.message || undefined
      );
    }

    res.json({ giftCard: updatedGiftCard });
  })
);

// Get gift cards for a train (organizer view)
router.get(
  '/train/:trainId',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { trainId } = req.params;

    const train = await prisma.mealTrain.findUnique({
      where: { id: trainId },
      include: { admins: true },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const isOrganizer = train.organizerId === req.user!.id;
    const isAdmin = train.admins.some((admin: { userId: string }) => admin.userId === req.user!.id);

    if (!isOrganizer && !isAdmin) {
      throw new AppError('Not authorized', 403);
    }

    const giftCards = await prisma.giftCard.findMany({
      where: { trainId },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await prisma.giftCard.aggregate({
      where: { trainId, status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
      _count: true,
    });

    res.json({
      giftCards,
      stats: {
        total: stats._sum.amount || 0,
        count: stats._count,
      },
    });
  })
);

// Resend gift card notification
router.post(
  '/:id/resend',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { email } = req.body;

    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
      include: {
        train: { include: { admins: true } },
      },
    });

    if (!giftCard) {
      throw new AppError('Gift card not found', 404);
    }

    const isOrganizer = giftCard.train.organizerId === req.user!.id;
    const isAdmin = giftCard.train.admins.some((admin: { userId: string }) => admin.userId === req.user!.id);

    if (!isOrganizer && !isAdmin) {
      throw new AppError('Not authorized', 403);
    }

    if (giftCard.status !== PaymentStatus.COMPLETED || !giftCard.code) {
      throw new AppError('Gift card has not been purchased yet', 400);
    }

    const targetEmail = email || giftCard.deliveryEmail;
    if (!targetEmail) {
      throw new AppError('No email address provided', 400);
    }

    await sendGiftCardNotification(
      targetEmail,
      giftCard.purchaserName,
      giftCard.amount.toString(),
      giftCard.vendor,
      giftCard.code,
      giftCard.message || undefined
    );

    // Update delivery email if changed
    if (email && email !== giftCard.deliveryEmail) {
      await prisma.giftCard.update({
        where: { id },
        data: { deliveryEmail: email },
      });
    }

    res.json({ message: 'Gift card notification sent' });
  })
);

export default router;
