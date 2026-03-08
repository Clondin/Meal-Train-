import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { generateGuestSessionToken } from '../utils/guestSessions.js';

const router = Router();

const EXPIRY_MINUTES = 15;

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

router.post(
  '/',
  [
    body('identifier').trim().notEmpty(),
    body('identifierType').isIn(['email', 'phone']),
  ],
  catchAsync(async (req, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { identifier, identifierType } = req.body;
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    const session = await prisma.guestSession.upsert({
      where: {
        identifier_identifierType: {
          identifier,
          identifierType,
        },
      },
      update: {
        verificationCode,
        verified: false,
        expiresAt,
      },
      create: {
        identifier,
        identifierType,
        verificationCode,
        expiresAt,
      },
      select: {
        id: true,
        identifier: true,
        identifierType: true,
        verified: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    res.status(201).json(session);
  })
);

router.post(
  '/verify',
  [
    body('identifier').trim().notEmpty(),
    body('identifierType').isIn(['email', 'phone']),
    body('verificationCode').trim().isLength({ min: 4, max: 10 }),
  ],
  catchAsync(async (req, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { identifier, identifierType, verificationCode } = req.body;

    const existing = await prisma.guestSession.findUnique({
      where: {
        identifier_identifierType: {
          identifier,
          identifierType,
        },
      },
    });

    if (!existing) {
      throw new AppError('Guest session not found', 404);
    }

    if (existing.expiresAt < new Date()) {
      throw new AppError('Verification code expired', 400);
    }

    if (existing.verificationCode !== verificationCode) {
      throw new AppError('Invalid verification code', 400);
    }

    const session = await prisma.guestSession.update({
      where: { id: existing.id },
      data: {
        verified: true,
        verificationCode: null,
      },
      select: {
        id: true,
        identifier: true,
        identifierType: true,
        verified: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    const token = generateGuestSessionToken({
      sessionId: session.id,
      identifier: session.identifier,
      identifierType: session.identifierType as 'email' | 'phone',
    });

    res.json({
      ...session,
      token,
    });
  })
);

export default router;
