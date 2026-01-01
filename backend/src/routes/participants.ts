import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth, AuthRequest, requireVerified } from '../middleware/auth.js';
import { sendParticipantSignupNotification } from '../services/email.js';
import { body, validationResult } from 'express-validator';
import { DateStatus, ParticipantStatus } from '@prisma/client';

const router = Router();

// Sign up for a date
router.post(
  '/',
  optionalAuth,
  [
    body('trainId').notEmpty(),
    body('dateId').notEmpty(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const {
      trainId,
      dateId,
      mealDescription,
      notes,
      guestName,
      guestEmail,
      guestPhone,
    } = req.body;

    // Get the train and date
    const train = await prisma.mealTrain.findUnique({
      where: { id: trainId },
      include: {
        organizer: { select: { email: true } },
      },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const date = await prisma.mealDate.findUnique({
      where: { id: dateId },
      include: {
        participants: {
          where: { status: { in: ['CONFIRMED', 'PENDING'] } },
        },
      },
    });

    if (!date || date.trainId !== trainId) {
      throw new AppError('Date not found', 404);
    }

    if (date.status === DateStatus.CLOSED || date.status === DateStatus.CANCELLED) {
      throw new AppError('This date is not available', 400);
    }

    // Check if date is full
    if (date.participants.length >= date.maxParticipants) {
      throw new AppError('This date is already fully booked', 400);
    }

    // Check if user already signed up
    if (req.user) {
      const existingParticipation = await prisma.participant.findFirst({
        where: {
          trainId,
          dateId,
          userId: req.user.id,
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      });

      if (existingParticipation) {
        throw new AppError('You have already signed up for this date', 400);
      }
    }

    // Determine status based on approval settings
    const status = train.requireApproval
      ? ParticipantStatus.PENDING
      : ParticipantStatus.CONFIRMED;

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        trainId,
        dateId,
        userId: req.user?.id,
        guestName: req.user ? null : guestName,
        guestEmail: req.user ? null : guestEmail,
        guestPhone: req.user ? null : guestPhone,
        mealDescription,
        notes,
        status,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        date: true,
      },
    });

    // Update date status if full
    const totalParticipants = date.participants.length + 1;
    if (totalParticipants >= date.maxParticipants) {
      await prisma.mealDate.update({
        where: { id: dateId },
        data: { status: DateStatus.FILLED },
      });
    }

    // Send notification to organizer
    const participantName = req.user
      ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email
      : guestName || 'A volunteer';

    await sendParticipantSignupNotification(
      train.organizer.email,
      participantName,
      train.title,
      date.date.toLocaleDateString(),
      mealDescription
    );

    res.status(201).json({
      participant,
      message: train.requireApproval
        ? 'Sign-up submitted. Awaiting organizer approval.'
        : 'Successfully signed up!',
    });
  })
);

// Update participation
router.patch(
  '/:id',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { mealDescription, notes, status } = req.body;

    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        train: { include: { admins: true } },
      },
    });

    if (!participant) {
      throw new AppError('Participation not found', 404);
    }

    // Check authorization
    const isOwner = participant.userId === req.user!.id;
    const isOrganizer = participant.train.organizerId === req.user!.id;
    const isAdmin = participant.train.admins.some((admin: { userId: string }) => admin.userId === req.user!.id);

    if (!isOwner && !isOrganizer && !isAdmin) {
      throw new AppError('Not authorized', 403);
    }

    // Only organizer/admin can change status
    const updateData: any = {};
    if (isOwner && !isOrganizer && !isAdmin) {
      if (mealDescription !== undefined) updateData.mealDescription = mealDescription;
      if (notes !== undefined) updateData.notes = notes;
    } else {
      if (mealDescription !== undefined) updateData.mealDescription = mealDescription;
      if (notes !== undefined) updateData.notes = notes;
      if (status !== undefined) updateData.status = status;
    }

    const updated = await prisma.participant.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        date: true,
      },
    });

    res.json({ participant: updated });
  })
);

// Cancel participation
router.delete(
  '/:id',
  optionalAuth,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        train: { include: { admins: true } },
        date: true,
      },
    });

    if (!participant) {
      throw new AppError('Participation not found', 404);
    }

    // Check authorization
    const isOwner = req.user && participant.userId === req.user.id;
    const isOrganizer = req.user && participant.train.organizerId === req.user.id;
    const isAdmin = req.user
      ? participant.train.admins.some((admin: { userId: string }) => admin.userId === req.user!.id)
      : false;

    if (!isOwner && !isOrganizer && !isAdmin) {
      throw new AppError('Not authorized', 403);
    }

    // Update to cancelled instead of deleting
    await prisma.participant.update({
      where: { id },
      data: { status: ParticipantStatus.CANCELLED },
    });

    // Re-open the date if it was filled
    if (participant.date.status === DateStatus.FILLED) {
      await prisma.mealDate.update({
        where: { id: participant.dateId },
        data: { status: DateStatus.AVAILABLE },
      });
    }

    res.json({ message: 'Participation cancelled successfully' });
  })
);

// Approve/reject participation (organizer only)
router.post(
  '/:id/approve',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { approved } = req.body;

    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        train: { include: { admins: true } },
      },
    });

    if (!participant) {
      throw new AppError('Participation not found', 404);
    }

    const isOrganizer = participant.train.organizerId === req.user!.id;
    const isAdmin = participant.train.admins.some((admin: { userId: string }) => admin.userId === req.user!.id);

    if (!isOrganizer && !isAdmin) {
      throw new AppError('Not authorized', 403);
    }

    if (participant.status !== ParticipantStatus.PENDING) {
      throw new AppError('This participation is not pending approval', 400);
    }

    const newStatus = approved
      ? ParticipantStatus.CONFIRMED
      : ParticipantStatus.CANCELLED;

    const updated = await prisma.participant.update({
      where: { id },
      data: { status: newStatus },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        date: true,
      },
    });

    // TODO: Send email notification to participant

    res.json({ participant: updated });
  })
);

// Get participants for a train (organizer view)
router.get(
  '/train/:trainId',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { trainId } = req.params;
    const { status } = req.query;

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

    const where: any = { trainId };
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const participants = await prisma.participant.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        date: true,
      },
      orderBy: [
        { date: { date: 'asc' } },
        { createdAt: 'asc' },
      ],
    });

    res.json({ participants });
  })
);

export default router;
