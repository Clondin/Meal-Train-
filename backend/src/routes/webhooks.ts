import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';
import { constructWebhookEvent } from '../services/stripe.js';
import { sendDonationConfirmation, sendGiftCardNotification } from '../services/email.js';
import { generateUniqueCode } from '../utils/slug.js';
import { PaymentStatus } from '@prisma/client';
import { logger } from '../services/logger.js';

const router = Router();

// Stripe webhook handler
router.post('/stripe', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    const event = await constructWebhookEvent(req.body, signature);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const metadata = session.metadata || {};

        if (metadata.type === 'donation' && metadata.donationId) {
          // Handle donation completion
          const donation = await prisma.donation.findUnique({
            where: { id: metadata.donationId },
            include: { train: true },
          });

          if (donation && donation.status !== PaymentStatus.COMPLETED) {
            await prisma.donation.update({
              where: { id: donation.id },
              data: {
                status: PaymentStatus.COMPLETED,
                stripePaymentId: session.payment_intent || session.id,
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
          }
        } else if (metadata.type === 'giftcard' && metadata.giftCardId) {
          // Handle gift card completion
          const giftCard = await prisma.giftCard.findUnique({
            where: { id: metadata.giftCardId },
            include: { train: true },
          });

          if (giftCard && giftCard.status !== PaymentStatus.COMPLETED) {
            const code = generateUniqueCode(12);

            await prisma.giftCard.update({
              where: { id: giftCard.id },
              data: {
                status: PaymentStatus.COMPLETED,
                stripePaymentId: session.payment_intent || session.id,
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
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        const metadata = paymentIntent.metadata || {};

        if (metadata.type === 'donation' && metadata.trainId) {
          // Find donation by payment intent ID
          const donation = await prisma.donation.findFirst({
            where: { stripePaymentId: paymentIntent.id },
            include: { train: true },
          });

          if (donation && donation.status !== PaymentStatus.COMPLETED) {
            await prisma.donation.update({
              where: { id: donation.id },
              data: { status: PaymentStatus.COMPLETED },
            });

            await sendDonationConfirmation(
              donation.donorEmail,
              donation.donorName,
              donation.amount.toString(),
              donation.train.title,
              donation.train.recipientName,
              donation.message || undefined
            );
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;

        // Update donation status to failed
        await prisma.donation.updateMany({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: PaymentStatus.FAILED },
        });

        // Update gift card status to failed
        await prisma.giftCard.updateMany({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: PaymentStatus.FAILED },
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;

        // Update donation status to refunded
        await prisma.donation.updateMany({
          where: { stripePaymentId: charge.payment_intent },
          data: { status: PaymentStatus.REFUNDED },
        });

        // Update gift card status to refunded
        await prisma.giftCard.updateMany({
          where: { stripePaymentId: charge.payment_intent },
          data: { status: PaymentStatus.REFUNDED },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error({ err: error }, 'Webhook error');
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
});

export default router;
