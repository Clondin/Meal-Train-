import { Prisma } from '@prisma/client';
import cron from 'node-cron';
import prisma from '../config/database.js';
import { sendReminderEmail, sendEmail } from './email.js';

const createNotification = async (input: {
  userId?: string | null;
  trainId?: string | null;
  type:
    | 'CONTRIBUTION_REMINDER'
    | 'DAY_OF_CONFIRMATION_REQUEST'
    | 'REMINDER';
  title: string;
  message: string;
  email?: string | null;
  data?: Record<string, unknown>;
}) => {
  await prisma.notification.create({
    data: {
      userId: input.userId || undefined,
      trainId: input.trainId || undefined,
      type: input.type,
      title: input.title,
      message: input.message,
      email: input.email || undefined,
      data: input.data as Prisma.InputJsonValue | undefined,
      sent: true,
      sentAt: new Date(),
    },
  });
};

const getDateRange = (offsetDays: number) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + offsetDays);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

async function sendTomorrowReminders() {
  const { start, end } = getDateRange(1);

  const contributions = await prisma.contribution.findMany({
    where: {
      status: { in: ['CONFIRMED', 'PENDING'] },
      reminderSent: false,
      slot: {
        date: {
          gte: start,
          lte: end,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      train: {
        enableReminders: true,
      },
    },
    include: {
      slot: true,
      train: true,
      user: true,
    },
  });

  for (const contribution of contributions) {
    const email = contribution.user?.email || contribution.guestEmail;
    const name =
      contribution.user?.firstName ||
      contribution.guestName ||
      contribution.user?.email ||
      'Volunteer';

    if (!email) continue;

    await sendReminderEmail(
      email,
      name,
      contribution.train.recipientName,
      contribution.train.title,
      contribution.slot.date.toDateString(),
      [
        contribution.train.recipientAddress,
        contribution.train.recipientCity,
        contribution.train.recipientState,
        contribution.train.recipientZip,
      ]
        .filter(Boolean)
        .join(', '),
      contribution.slot.startTime || contribution.train.defaultDeliveryTime,
      contribution.itemDescription || undefined,
      contribution.train.slug
    );

    await prisma.contribution.update({
      where: { id: contribution.id },
      data: {
        reminderSent: true,
        reminderSentAt: new Date(),
      },
    });

    await createNotification({
      userId: contribution.userId,
      trainId: contribution.trainId,
      type: 'CONTRIBUTION_REMINDER',
      title: 'Contribution reminder',
      message: `Reminder sent for ${contribution.train.title} on ${contribution.slot.date.toDateString()}.`,
      email,
      data: { contributionId: contribution.id },
    });
  }
}

async function sendDayOfConfirmations() {
  const { start, end } = getDateRange(0);

  const contributions = await prisma.contribution.findMany({
    where: {
      status: 'CONFIRMED',
      confirmedMealCategory: false,
      dayOfReminderSent: false,
      slot: {
        date: {
          gte: start,
          lte: end,
        },
      },
      train: {
        requireMilchigFleishig: true,
      },
    },
    include: {
      slot: true,
      train: true,
      user: true,
    },
  });

  for (const contribution of contributions) {
    const email = contribution.user?.email || contribution.guestEmail;
    const name =
      contribution.user?.firstName ||
      contribution.guestName ||
      contribution.user?.email ||
      'Volunteer';

    if (email) {
      await sendEmail({
        to: email,
        subject: `Please confirm your meal category for ${contribution.train.title}`,
        html: `<p>Hi ${name},</p><p>Please confirm whether your meal is milchig, fleishig, or pareve for today&apos;s delivery.</p>`,
      });
    }

    await prisma.contribution.update({
      where: { id: contribution.id },
      data: {
        dayOfReminderSent: true,
        dayOfReminderSentAt: new Date(),
      },
    });

    await createNotification({
      userId: contribution.userId,
      trainId: contribution.trainId,
      type: 'DAY_OF_CONFIRMATION_REQUEST',
      title: 'Confirm meal category',
      message: `Please confirm your meal category for today's delivery to ${contribution.train.recipientName}.`,
      email,
      data: { contributionId: contribution.id },
    });
  }
}

async function sendWeeklyOrganizerDigest() {
  const organizers = await prisma.user.findMany({
    where: {
      organizedTrains: {
        some: {
          status: 'ACTIVE',
        },
      },
    },
    include: {
      organizedTrains: {
        where: { status: 'ACTIVE' },
        include: {
          taskSlots: true,
          donations: {
            where: { status: 'COMPLETED' },
          },
        },
      },
    },
  });

  for (const organizer of organizers) {
    if (!organizer.email) continue;

    const digestLines = organizer.organizedTrains.map((train) => {
      const filled = train.taskSlots.filter((slot) =>
        ['FILLED', 'PARTIALLY_FILLED'].includes(slot.status)
      ).length;
      const open = train.taskSlots.filter((slot) => slot.status === 'AVAILABLE').length;
      const donationTotal = train.donations.reduce(
        (sum, donation) => sum + Number(donation.amount),
        0
      );

      return `<li><strong>${train.title}</strong>: ${filled} filled slots, ${open} open slots, $${donationTotal.toFixed(2)} donated</li>`;
    });

    await sendEmail({
      to: organizer.email,
      subject: 'Your weekly Chesed Train digest',
      html: `<p>Here is your weekly organizer digest.</p><ul>${digestLines.join('')}</ul>`,
    });

    await createNotification({
      userId: organizer.id,
      type: 'REMINDER',
      title: 'Weekly digest sent',
      message: 'Your weekly organizer digest is ready.',
      email: organizer.email,
    });
  }
}

export function startScheduler() {
  cron.schedule('0 8 * * *', () => {
    void sendTomorrowReminders();
  });

  cron.schedule('0 7 * * *', () => {
    void sendDayOfConfirmations();
  });

  cron.schedule('0 9 * * 1', () => {
    void sendWeeklyOrganizerDigest();
  });
}
