import { PrismaClient, TrainType, TrainStatus, TrainCategory, DateStatus, ParticipantStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user1 = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      email: 'organizer@example.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      emailVerified: true,
      timezone: 'America/New_York',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'volunteer@example.com' },
    update: {},
    create: {
      email: 'volunteer@example.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Smith',
      emailVerified: true,
      timezone: 'America/New_York',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'helper@example.com' },
    update: {},
    create: {
      email: 'helper@example.com',
      password: hashedPassword,
      firstName: 'Emily',
      lastName: 'Davis',
      emailVerified: true,
      timezone: 'America/Chicago',
    },
  });

  console.log('Created users:', user1.email, user2.email, user3.email);

  // Create sample meal trains
  const train1 = await prisma.mealTrain.upsert({
    where: { slug: 'meals-for-the-thompsons-abc12345' },
    update: {},
    create: {
      slug: 'meals-for-the-thompsons-abc12345',
      title: 'Meals for the Thompsons',
      description: 'Help us support the Thompson family during this difficult time.',
      story: 'The Thompson family recently welcomed their new baby, Emma, and could use some help with meals during these first few weeks. Any support is greatly appreciated!',
      recipientName: 'Thompson Family',
      recipientEmail: 'thompsons@example.com',
      recipientPhone: '555-123-4567',
      recipientAddress: '123 Main Street',
      recipientCity: 'Springfield',
      recipientState: 'IL',
      recipientZip: '62701',
      dietaryPreferences: 'No dietary restrictions',
      allergies: 'Peanut allergy',
      foodLikes: 'Italian, Mexican, Asian cuisine',
      foodDislikes: 'Seafood',
      deliveryInstructions: 'Please ring the doorbell. The dog is friendly!',
      householdSize: 4,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      defaultDeliveryTime: '18:00',
      timezone: 'America/Chicago',
      isPublic: true,
      allowDonations: true,
      allowGiftCards: true,
      donationGoal: 500,
      trainType: TrainType.STANDARD,
      status: TrainStatus.ACTIVE,
      category: TrainCategory.NEW_BABY,
      organizerId: user1.id,
    },
  });

  // Create dates for train1
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    await prisma.mealDate.upsert({
      where: {
        trainId_date: {
          trainId: train1.id,
          date,
        },
      },
      update: {},
      create: {
        trainId: train1.id,
        date,
        deliveryTime: '18:00',
        maxParticipants: 1,
        status: DateStatus.AVAILABLE,
      },
    });
  }

  // Add some participants
  const dates = await prisma.mealDate.findMany({
    where: { trainId: train1.id },
    orderBy: { date: 'asc' },
    take: 3,
  });

  if (dates.length > 0) {
    await prisma.participant.upsert({
      where: {
        id: 'participant-1',
      },
      update: {},
      create: {
        id: 'participant-1',
        trainId: train1.id,
        dateId: dates[0].id,
        userId: user2.id,
        mealDescription: 'Homemade lasagna with garlic bread and salad',
        status: ParticipantStatus.CONFIRMED,
      },
    });

    // Update date status
    await prisma.mealDate.update({
      where: { id: dates[0].id },
      data: { status: DateStatus.FILLED },
    });
  }

  if (dates.length > 1) {
    await prisma.participant.upsert({
      where: {
        id: 'participant-2',
      },
      update: {},
      create: {
        id: 'participant-2',
        trainId: train1.id,
        dateId: dates[1].id,
        userId: user3.id,
        mealDescription: 'Chicken stir-fry with rice and egg rolls',
        status: ParticipantStatus.CONFIRMED,
      },
    });

    await prisma.mealDate.update({
      where: { id: dates[1].id },
      data: { status: DateStatus.FILLED },
    });
  }

  // Add a donation
  await prisma.donation.upsert({
    where: { id: 'donation-1' },
    update: {},
    create: {
      id: 'donation-1',
      trainId: train1.id,
      userId: user2.id,
      donorName: 'Mike Smith',
      donorEmail: 'volunteer@example.com',
      amount: 50,
      message: 'Wishing your family all the best!',
      status: PaymentStatus.COMPLETED,
    },
  });

  // Create a second meal train (potluck style)
  const train2 = await prisma.mealTrain.upsert({
    where: { slug: 'community-potluck-def67890' },
    update: {},
    create: {
      slug: 'community-potluck-def67890',
      title: 'Community Support Potluck',
      description: 'Weekly community meal support for those in need.',
      story: 'Our community is coming together to provide weekly meals for families going through tough times.',
      recipientName: 'Community Families',
      recipientAddress: '456 Community Center',
      recipientCity: 'Springfield',
      recipientState: 'IL',
      recipientZip: '62702',
      householdSize: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      defaultDeliveryTime: '12:00',
      timezone: 'America/Chicago',
      isPublic: true,
      allowDonations: true,
      trainType: TrainType.POTLUCK,
      status: TrainStatus.ACTIVE,
      category: TrainCategory.OTHER,
      organizerId: user1.id,
    },
  });

  console.log('Created meal trains:', train1.title, train2.title);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
