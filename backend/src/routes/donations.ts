import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { createPaymentIntent, createCheckoutSession } from '../services/stripe.js';
import { sendDonationConfirmation } from '../services/email.js';
import { body, validationResult } from 'express-validator';
import { PaymentStatus } from '@prisma/client';

const router = Router();

// Create donation (with Stripe payment intent)
router.post(
  '/',
  optionalAuth,
  [
    body('trainId').notEmpty(),
    body('amount').isFloat({ min: 1 }),
    body('donorName').trim().isLength({ min: 1 }),
    body('donorEmail').isEmail(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const {
      trainId,
      amount,
      donorName,
      donorEmail,
      message,
      isAnonymous,
    } = req.body;

    // Verify train exists and allows donations
    const train = await prisma.mealTrain.findUnique({
      where: { id: trainId },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!train.allowDonations) {
      throw new AppError('This meal train does not accept donations', 400);
    }

    // Create Stripe payment intent
    const amountInCents = Math.round(amount * 100);
    const paymentIntent = await createPaymentIntent({
      amount: amountInCents,
      description: `Donation to ${train.title}`,
      metadata: {
        type: 'donation',
        trainId,
        donorEmail,
      },
    });

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        trainId,
        userId: req.user?.id,
        donorName,
        donorEmail,
        amount,
        isAnonymous: isAnonymous ?? false,
        message,
        stripePaymentId: paymentIntent.id,
        status: PaymentStatus.PENDING,
      },
    });

    res.status(201).json({
      donation,
      clientSecret: paymentIntent.client_secret,
    });
  })
);

// Create checkout session for donation
router.post(
  '/checkout',
  optionalAuth,
  [
    body('trainId').notEmpty(),
    body('amount').isFloat({ min: 1 }),
    body('donorName').trim().isLength({ min: 1 }),
    body('donorEmail').isEmail(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const {
      trainId,
      amount,
      donorName,
      donorEmail,
      message,
      isAnonymous,
      successUrl,
      cancelUrl,
    } = req.body;

    const train = await prisma.mealTrain.findUnique({
      where: { id: trainId },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!train.allowDonations) {
      throw new AppError('This meal train does not accept donations', 400);
    }

    // Create donation record first
    const donation = await prisma.donation.create({
      data: {
        trainId,
        userId: req.user?.id,
        donorName,
        donorEmail,
        amount,
        isAnonymous: isAnonymous ?? false,
        message,
        status: PaymentStatus.PENDING,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      amount: Math.round(amount * 100),
      customerEmail: donorEmail,
      successUrl: successUrl || `${frontendUrl}/train/${train.slug}?donation=success`,
      cancelUrl: cancelUrl || `${frontendUrl}/train/${train.slug}?donation=cancelled`,
      metadata: {
        type: 'donation',
        donationId: donation.id,
        trainId,
      },
    });

    // Update donation with session ID
    await prisma.donation.update({
      where: { id: donation.id },
      data: { stripePaymentId: session.id },
    });

    res.json({ sessionUrl: session.url });
  })
);

// Confirm donation (after successful payment)
router.post(
  '/:id/confirm',
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { paymentIntentId } = req.body;

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        train: true,
      },
    });

    if (!donation) {
      throw new AppError('Donation not found', 404);
    }

    if (donation.status === PaymentStatus.COMPLETED) {
      return res.json({ donation, message: 'Donation already confirmed' });
    }

    // Update donation status
    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: {
        status: PaymentStatus.COMPLETED,
        stripePaymentId: paymentIntentId || donation.stripePaymentId,
      },
    });

    // Send confirmation email
    await sendDonationConfirmation(
      donation.donorEmail,
      donation.donorName,
      donation.amount.toString(),
      donation.train.title,
      donation.train.recipientName,
      donation.message || undefined
    );

    res.json({ donation: updatedDonation });
  })
);

// Get donations for a train (organizer view)
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

    const donations = await prisma.donation.findMany({
      where: { trainId },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await prisma.donation.aggregate({
      where: { trainId, status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
      _count: true,
    });

    res.json({
      donations,
      stats: {
        total: stats._sum.amount || 0,
        count: stats._count,
      },
    });
  })
);

// Get public donation list (anonymized)
router.get(
  '/train/:trainId/public',
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { trainId } = req.params;

    const train = await prisma.mealTrain.findUnique({
      where: { id: trainId },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const donations = await prisma.donation.findMany({
      where: {
        trainId,
        status: PaymentStatus.COMPLETED,
      },
      select: {
        id: true,
        donorName: true,
        amount: true,
        message: true,
        isAnonymous: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Anonymize names for anonymous donations
    const publicDonations = donations.map((donation) => ({
      ...donation,
      donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName,
    }));

    res.json({ donations: publicDonations });
  })
);

export default router;
