import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { DeliveryStatus, ContributionStatus } from '@prisma/client';
import { sendDeliveryStatusUpdate } from '../services/email.js';
import { requireVerifiedGuestSession } from '../utils/guestSessions.js';

const router = Router();

const canUpdateContribution = (
  contribution: { userId?: string | null; guestEmail?: string | null; guestPhone?: string | null },
  req: AuthRequest
) => {
  if (req.user && contribution.userId && contribution.userId === req.user.id) {
    return true;
  }
  return false;
};

// Update contribution (delivery status, confirmation, notes)
router.patch(
  '/:id',
  optionalAuth,
  [
    body('deliveryStatus').optional().isString(),
    body('estimatedArrival').optional().isISO8601(),
    body('confirmedMealCategory').optional().isBoolean(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { id } = req.params;
    const { deliveryStatus, estimatedArrival, confirmedMealCategory, status, itemDescription, notes } = req.body;

    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        train: true,
        slot: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!contribution) {
      throw new AppError('Contribution not found', 404);
    }

    if (!req.user && (contribution.guestEmail || contribution.guestPhone)) {
      await requireVerifiedGuestSession(req, {
        identifier: contribution.guestEmail || contribution.guestPhone || undefined,
        identifierType: contribution.guestEmail ? 'email' : 'phone',
      });
    }

    if (!canUpdateContribution(contribution, req)) {
      const isOrganizer = req.user && contribution.train.organizerId === req.user.id;
      const isAdmin = req.user
        ? await prisma.trainAdmin.findFirst({ where: { trainId: contribution.trainId, userId: req.user.id } })
        : null;
      if (!isOrganizer && !isAdmin) {
        throw new AppError('Not authorized', 403);
      }
    }

    const updateData: any = {};
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus as DeliveryStatus;
    if (estimatedArrival) updateData.estimatedArrival = new Date(estimatedArrival);
    if (confirmedMealCategory !== undefined) {
      updateData.confirmedMealCategory = confirmedMealCategory;
      updateData.confirmedAt = confirmedMealCategory ? new Date() : null;
    }
    if (status) updateData.status = status as ContributionStatus;
    if (itemDescription !== undefined) updateData.itemDescription = itemDescription;
    if (notes !== undefined) updateData.notes = notes;
    if (deliveryStatus) updateData.deliveryStatusUpdatedAt = new Date();

    const updated = await prisma.contribution.update({
      where: { id },
      data: updateData,
    });

    if (deliveryStatus) {
      const message = `${deliveryStatus.replace(/_/g, ' ').toLowerCase()}`;
      await prisma.notification.create({
        data: {
          trainId: contribution.trainId,
          type: 'DELIVERY_STATUS_UPDATE',
          title: 'Delivery Status Updated',
          message: `Delivery is now ${message}.`,
          email: contribution.train.recipientEmail || undefined,
        },
      });

      if (contribution.train.recipientEmail) {
        await sendDeliveryStatusUpdate(
          contribution.train.recipientEmail,
          contribution.train.recipientName,
          contribution.train.title,
          contribution.slot?.date?.toISOString?.() || new Date().toISOString(),
          deliveryStatus
        );
      }
    }

    res.json({ contribution: updated });
  })
);

export default router;
