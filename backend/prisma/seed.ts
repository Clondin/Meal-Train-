import {
  PrismaClient,
  TrainType,
  TrainStatus,
  TrainCategory,
  DateStatus,
  ParticipantStatus,
  PaymentStatus,
  TaskType,
  SlotStatus,
  ContributionStatus,
  DeliveryStatus,
  SimchaItemCategory,
  MealCategory,
  NotificationType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 12);
  const today = startOfDay(new Date());

  const [organizer, volunteer, helper] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'organizer@example.com' },
      update: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        emailVerified: true,
        timezone: 'America/New_York',
      },
      create: {
        email: 'organizer@example.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        emailVerified: true,
        timezone: 'America/New_York',
      },
    }),
    prisma.user.upsert({
      where: { email: 'volunteer@example.com' },
      update: {
        firstName: 'Mike',
        lastName: 'Smith',
        emailVerified: true,
        timezone: 'America/New_York',
      },
      create: {
        email: 'volunteer@example.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Smith',
        emailVerified: true,
        timezone: 'America/New_York',
      },
    }),
    prisma.user.upsert({
      where: { email: 'helper@example.com' },
      update: {
        firstName: 'Emily',
        lastName: 'Davis',
        emailVerified: true,
        timezone: 'America/Chicago',
      },
      create: {
        email: 'helper@example.com',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Davis',
        emailVerified: true,
        timezone: 'America/Chicago',
      },
    }),
  ]);

  const mealTrain = await prisma.mealTrain.upsert({
    where: { slug: 'meals-for-the-thompsons-abc12345' },
    update: {
      title: 'Meals for the Thompsons',
      description: 'Help the Thompson family during the first few weeks after welcoming a new baby.',
      story:
        'The Thompson family recently welcomed baby Emma and could use practical help with dinners, errands, and childcare pickups while they settle in.',
      recipientName: 'Thompson Family',
      recipientEmail: 'thompsons@example.com',
      recipientPhone: '555-123-4567',
      recipientAddress: '123 Main Street',
      recipientCity: 'Springfield',
      recipientState: 'IL',
      recipientZip: '62701',
      householdSize: 4,
      dietaryPreferences: 'Family-friendly comfort food preferred',
      allergies: 'Peanut allergy',
      deliveryInstructions: 'Please leave food on the bench by the front door.',
      requireMilchigFleishig: true,
      acceptsMilchig: true,
      acceptsFleishig: true,
      acceptsPareve: true,
      requireGlatt: true,
      allergyNuts: true,
      allowDonations: true,
      allowGiftCards: true,
      allowNonMealTasks: true,
      requireApproval: false,
      enableReminders: true,
      reminderHours: 24,
      donationGoal: 750,
      startDate: today,
      endDate: addDays(today, 14),
      defaultDeliveryTime: '18:00',
      timezone: 'America/Chicago',
      isPublic: true,
      trainType: TrainType.FULL_CHESED,
      status: TrainStatus.ACTIVE,
      category: TrainCategory.NEW_BABY,
      organizerId: organizer.id,
    },
    create: {
      slug: 'meals-for-the-thompsons-abc12345',
      title: 'Meals for the Thompsons',
      description: 'Help the Thompson family during the first few weeks after welcoming a new baby.',
      story:
        'The Thompson family recently welcomed baby Emma and could use practical help with dinners, errands, and childcare pickups while they settle in.',
      recipientName: 'Thompson Family',
      recipientEmail: 'thompsons@example.com',
      recipientPhone: '555-123-4567',
      recipientAddress: '123 Main Street',
      recipientCity: 'Springfield',
      recipientState: 'IL',
      recipientZip: '62701',
      householdSize: 4,
      dietaryPreferences: 'Family-friendly comfort food preferred',
      allergies: 'Peanut allergy',
      deliveryInstructions: 'Please leave food on the bench by the front door.',
      requireMilchigFleishig: true,
      acceptsMilchig: true,
      acceptsFleishig: true,
      acceptsPareve: true,
      requireGlatt: true,
      allergyNuts: true,
      allowDonations: true,
      allowGiftCards: true,
      allowNonMealTasks: true,
      requireApproval: false,
      enableReminders: true,
      reminderHours: 24,
      donationGoal: 750,
      startDate: today,
      endDate: addDays(today, 14),
      defaultDeliveryTime: '18:00',
      timezone: 'America/Chicago',
      isPublic: true,
      trainType: TrainType.FULL_CHESED,
      status: TrainStatus.ACTIVE,
      category: TrainCategory.NEW_BABY,
      organizerId: organizer.id,
    },
  });

  await prisma.trainAdmin.upsert({
    where: {
      trainId_userId: {
        trainId: mealTrain.id,
        userId: helper.id,
      },
    },
    update: {},
    create: {
      trainId: mealTrain.id,
      userId: helper.id,
    },
  });

  const legacyDate = await prisma.mealDate.upsert({
    where: {
      trainId_date: {
        trainId: mealTrain.id,
        date: addDays(today, 1),
      },
    },
    update: {
      deliveryTime: '18:00',
      maxParticipants: 1,
      status: DateStatus.FILLED,
    },
    create: {
      trainId: mealTrain.id,
      date: addDays(today, 1),
      deliveryTime: '18:00',
      maxParticipants: 1,
      status: DateStatus.FILLED,
    },
  });

  await prisma.participant.upsert({
    where: { id: 'participant-1' },
    update: {
      trainId: mealTrain.id,
      dateId: legacyDate.id,
      userId: volunteer.id,
      mealDescription: 'Homemade baked ziti, salad, and garlic knots',
      status: ParticipantStatus.CONFIRMED,
    },
    create: {
      id: 'participant-1',
      trainId: mealTrain.id,
      dateId: legacyDate.id,
      userId: volunteer.id,
      mealDescription: 'Homemade baked ziti, salad, and garlic knots',
      status: ParticipantStatus.CONFIRMED,
    },
  });

  const [dinnerSlot, childcareSlot, shabbosSlot] = await Promise.all([
    prisma.taskSlot.upsert({
      where: {
        trainId_date_taskType: {
          trainId: mealTrain.id,
          date: addDays(today, 1),
          taskType: TaskType.MEAL_DINNER,
        },
      },
      update: {
        allowSplit: true,
        maxContributors: 3,
        startTime: '17:30',
        endTime: '18:30',
        notes: 'Please include enough for two adults and two children.',
        status: SlotStatus.PARTIALLY_FILLED,
      },
      create: {
        trainId: mealTrain.id,
        date: addDays(today, 1),
        taskType: TaskType.MEAL_DINNER,
        allowSplit: true,
        maxContributors: 3,
        startTime: '17:30',
        endTime: '18:30',
        notes: 'Please include enough for two adults and two children.',
        status: SlotStatus.PARTIALLY_FILLED,
      },
    }),
    prisma.taskSlot.upsert({
      where: {
        trainId_date_taskType: {
          trainId: mealTrain.id,
          date: addDays(today, 3),
          taskType: TaskType.CHILDCARE_PICKUP,
        },
      },
      update: {
        taskTitle: 'School pickup',
        taskDescription: 'Pick up the older children from school and bring them home.',
        startTime: '15:00',
        endTime: '16:00',
        location: 'Springfield Day School',
        status: SlotStatus.FILLED,
      },
      create: {
        trainId: mealTrain.id,
        date: addDays(today, 3),
        taskType: TaskType.CHILDCARE_PICKUP,
        taskTitle: 'School pickup',
        taskDescription: 'Pick up the older children from school and bring them home.',
        startTime: '15:00',
        endTime: '16:00',
        location: 'Springfield Day School',
        status: SlotStatus.FILLED,
      },
    }),
    prisma.taskSlot.upsert({
      where: {
        trainId_date_taskType: {
          trainId: mealTrain.id,
          date: addDays(today, 5),
          taskType: TaskType.MEAL_SHABBOS_DAY,
        },
      },
      update: {
        allowSplit: false,
        maxContributors: 1,
        startTime: '11:30',
        endTime: '12:30',
        notes: 'Drop off before candle-lighting if possible.',
        status: SlotStatus.AVAILABLE,
      },
      create: {
        trainId: mealTrain.id,
        date: addDays(today, 5),
        taskType: TaskType.MEAL_SHABBOS_DAY,
        allowSplit: false,
        maxContributors: 1,
        startTime: '11:30',
        endTime: '12:30',
        notes: 'Drop off before candle-lighting if possible.',
        status: SlotStatus.AVAILABLE,
      },
    }),
  ]);

  const [mealContribution, taskContribution, guestContribution] = await Promise.all([
    prisma.contribution.upsert({
      where: { id: 'contribution-1' },
      update: {
        slotId: dinnerSlot.id,
        trainId: mealTrain.id,
        userId: volunteer.id,
        mealComponent: 'PROTEIN_MAIN',
        mealCategory: MealCategory.FLEISHIG,
        isGlatt: true,
        itemDescription: 'Chicken cutlets',
        notes: 'Will deliver in disposable pans.',
        status: ContributionStatus.CONFIRMED,
        deliveryStatus: DeliveryStatus.PREPARING,
      },
      create: {
        id: 'contribution-1',
        slotId: dinnerSlot.id,
        trainId: mealTrain.id,
        userId: volunteer.id,
        mealComponent: 'PROTEIN_MAIN',
        mealCategory: MealCategory.FLEISHIG,
        isGlatt: true,
        itemDescription: 'Chicken cutlets',
        notes: 'Will deliver in disposable pans.',
        status: ContributionStatus.CONFIRMED,
        deliveryStatus: DeliveryStatus.PREPARING,
      },
    }),
    prisma.contribution.upsert({
      where: { id: 'contribution-2' },
      update: {
        slotId: childcareSlot.id,
        trainId: mealTrain.id,
        userId: helper.id,
        mealComponent: 'OTHER',
        itemDescription: 'Drive carpool home',
        notes: 'Can stay for homework if needed.',
        status: ContributionStatus.CONFIRMED,
        deliveryStatus: DeliveryStatus.NOT_STARTED,
      },
      create: {
        id: 'contribution-2',
        slotId: childcareSlot.id,
        trainId: mealTrain.id,
        userId: helper.id,
        mealComponent: 'OTHER',
        itemDescription: 'Drive carpool home',
        notes: 'Can stay for homework if needed.',
        status: ContributionStatus.CONFIRMED,
        deliveryStatus: DeliveryStatus.NOT_STARTED,
      },
    }),
    prisma.contribution.upsert({
      where: { id: 'contribution-3' },
      update: {
        slotId: dinnerSlot.id,
        trainId: mealTrain.id,
        guestName: 'Rachel Green',
        guestEmail: 'rachel@example.com',
        guestPhone: '555-777-1212',
        guestVerified: true,
        mealComponent: 'SALAD',
        mealCategory: MealCategory.PAREVE,
        itemDescription: 'Israeli salad',
        status: ContributionStatus.CONFIRMED,
        deliveryStatus: DeliveryStatus.NOT_STARTED,
      },
      create: {
        id: 'contribution-3',
        slotId: dinnerSlot.id,
        trainId: mealTrain.id,
        guestName: 'Rachel Green',
        guestEmail: 'rachel@example.com',
        guestPhone: '555-777-1212',
        guestVerified: true,
        mealComponent: 'SALAD',
        mealCategory: MealCategory.PAREVE,
        itemDescription: 'Israeli salad',
        status: ContributionStatus.CONFIRMED,
        deliveryStatus: DeliveryStatus.NOT_STARTED,
      },
    }),
  ]);

  await prisma.taskSlot.update({
    where: { id: dinnerSlot.id },
    data: { status: SlotStatus.PARTIALLY_FILLED },
  });

  await prisma.taskSlot.update({
    where: { id: childcareSlot.id },
    data: { status: SlotStatus.FILLED },
  });

  await prisma.donation.upsert({
    where: { id: 'donation-1' },
    update: {
      trainId: mealTrain.id,
      userId: helper.id,
      donorName: 'Emily Davis',
      donorEmail: 'helper@example.com',
      amount: 75,
      message: 'Happy to help with takeout or groceries.',
      status: PaymentStatus.COMPLETED,
    },
    create: {
      id: 'donation-1',
      trainId: mealTrain.id,
      userId: helper.id,
      donorName: 'Emily Davis',
      donorEmail: 'helper@example.com',
      amount: 75,
      message: 'Happy to help with takeout or groceries.',
      status: PaymentStatus.COMPLETED,
    },
  });

  await prisma.giftCard.upsert({
    where: { id: 'gift-card-1' },
    update: {
      trainId: mealTrain.id,
      userId: volunteer.id,
      purchaserName: 'Mike Smith',
      purchaserEmail: 'volunteer@example.com',
      amount: 50,
      vendor: 'DoorDash',
      code: 'DD-TEST-2026',
      deliveryEmail: 'thompsons@example.com',
      status: PaymentStatus.COMPLETED,
      deliveredAt: addDays(today, 2),
    },
    create: {
      id: 'gift-card-1',
      trainId: mealTrain.id,
      userId: volunteer.id,
      purchaserName: 'Mike Smith',
      purchaserEmail: 'volunteer@example.com',
      amount: 50,
      vendor: 'DoorDash',
      code: 'DD-TEST-2026',
      deliveryEmail: 'thompsons@example.com',
      status: PaymentStatus.COMPLETED,
      deliveredAt: addDays(today, 2),
    },
  });

  await prisma.notification.upsert({
    where: { id: 'notification-1' },
    update: {
      userId: volunteer.id,
      trainId: mealTrain.id,
      type: NotificationType.CONTRIBUTION_REMINDER,
      title: 'Upcoming delivery reminder',
      message: 'Your dinner contribution is scheduled for tomorrow evening.',
      sent: true,
      sentAt: new Date(),
    },
    create: {
      id: 'notification-1',
      userId: volunteer.id,
      trainId: mealTrain.id,
      type: NotificationType.CONTRIBUTION_REMINDER,
      title: 'Upcoming delivery reminder',
      message: 'Your dinner contribution is scheduled for tomorrow evening.',
      sent: true,
      sentAt: new Date(),
    },
  });

  await prisma.thankYouNote.upsert({
    where: { id: 'thank-you-1' },
    update: {
      trainId: mealTrain.id,
      contributionId: mealContribution.id,
      recipientUserId: volunteer.id,
      message: 'Thank you for handling dinner so quickly. It made the evening much easier for the family.',
    },
    create: {
      id: 'thank-you-1',
      trainId: mealTrain.id,
      contributionId: mealContribution.id,
      recipientUserId: volunteer.id,
      message: 'Thank you for handling dinner so quickly. It made the evening much easier for the family.',
    },
  });

  const simchaTrain = await prisma.mealTrain.upsert({
    where: { slug: 'levi-sheva-brachos-simcha-2026' },
    update: {
      title: 'Levi Sheva Brachos Contributions',
      description: 'Coordinate who is bringing what for the Levi family sheva brachos.',
      recipientName: 'Levi Family',
      recipientAddress: '456 Community Lane',
      recipientCity: 'Springfield',
      recipientState: 'IL',
      recipientZip: '62702',
      householdSize: 30,
      startDate: addDays(today, 7),
      endDate: addDays(today, 7),
      defaultDeliveryTime: '19:00',
      timezone: 'America/Chicago',
      isPublic: true,
      allowDonations: false,
      allowGiftCards: false,
      trainType: TrainType.SIMCHA,
      status: TrainStatus.ACTIVE,
      category: TrainCategory.SIMCHA,
      organizerId: organizer.id,
    },
    create: {
      slug: 'levi-sheva-brachos-simcha-2026',
      title: 'Levi Sheva Brachos Contributions',
      description: 'Coordinate who is bringing what for the Levi family sheva brachos.',
      recipientName: 'Levi Family',
      recipientAddress: '456 Community Lane',
      recipientCity: 'Springfield',
      recipientState: 'IL',
      recipientZip: '62702',
      householdSize: 30,
      startDate: addDays(today, 7),
      endDate: addDays(today, 7),
      defaultDeliveryTime: '19:00',
      timezone: 'America/Chicago',
      isPublic: true,
      allowDonations: false,
      allowGiftCards: false,
      trainType: TrainType.SIMCHA,
      status: TrainStatus.ACTIVE,
      category: TrainCategory.SIMCHA,
      organizerId: organizer.id,
    },
  });

  await prisma.simchaContribution.upsert({
    where: { id: 'simcha-contribution-1' },
    update: {
      trainId: simchaTrain.id,
      userId: volunteer.id,
      itemCategory: SimchaItemCategory.MAIN_DISH,
      itemDescription: 'Chicken marsala',
      servings: 18,
      quantity: '2 hotel pans',
      mealCategory: MealCategory.FLEISHIG,
      isGlatt: true,
      notes: 'Can deliver an hour before the event.',
    },
    create: {
      id: 'simcha-contribution-1',
      trainId: simchaTrain.id,
      userId: volunteer.id,
      itemCategory: SimchaItemCategory.MAIN_DISH,
      itemDescription: 'Chicken marsala',
      servings: 18,
      quantity: '2 hotel pans',
      mealCategory: MealCategory.FLEISHIG,
      isGlatt: true,
      notes: 'Can deliver an hour before the event.',
    },
  });

  await prisma.simchaContribution.upsert({
    where: { id: 'simcha-contribution-2' },
    update: {
      trainId: simchaTrain.id,
      guestName: 'Naomi Cohen',
      guestEmail: 'naomi@example.com',
      itemCategory: SimchaItemCategory.DESSERT,
      itemDescription: 'Assorted mini pastries',
      quantity: '3 platters',
      servings: 24,
      mealCategory: MealCategory.PAREVE,
      notes: 'Bakery pickup on the way.',
    },
    create: {
      id: 'simcha-contribution-2',
      trainId: simchaTrain.id,
      guestName: 'Naomi Cohen',
      guestEmail: 'naomi@example.com',
      itemCategory: SimchaItemCategory.DESSERT,
      itemDescription: 'Assorted mini pastries',
      quantity: '3 platters',
      servings: 24,
      mealCategory: MealCategory.PAREVE,
      notes: 'Bakery pickup on the way.',
    },
  });

  console.log('Seed complete.');
  console.log(`Organizer login: ${organizer.email} / password123`);
  console.log(`Volunteer login: ${volunteer.email} / password123`);
  console.log(`Helper login: ${helper.email} / password123`);
  console.log(`Primary train: ${mealTrain.slug}`);
  console.log(`Simcha train: ${simchaTrain.slug}`);
  console.log(`Open shabbos slot id: ${shabbosSlot.id}`);
  console.log(`Sample task contribution id: ${taskContribution.id}`);
  console.log(`Sample guest contribution id: ${guestContribution.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
