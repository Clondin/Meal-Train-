import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth, AuthRequest, requireVerified } from '../middleware/auth.js';
import { generateSlug } from '../utils/slug.js';
import { body, query, validationResult } from 'express-validator';
import {
  Prisma,
  TrainStatus,
  TrainType,
  TrainCategory,
  DateStatus,
  SlotStatus,
  ContributionStatus,
  TaskType,
  SimchaItemCategory,
  MealCategory,
} from '@prisma/client';

const router = Router();

const findTrainByIdentifier = async (
  identifier: string,
  include?: Prisma.MealTrainInclude
) => {
  return prisma.mealTrain.findFirst({
    where: {
      OR: [{ slug: identifier }, { id: identifier }],
    },
    include,
  });
};

const isOrganizerOrAdmin = (train: { organizerId: string; admins?: { userId: string }[] }, userId: string) => {
  const isOrganizer = train.organizerId === userId;
  const isAdmin = train.admins?.some(a => a.userId === userId) || false;
  return isOrganizer || isAdmin;
};

const contributionInclude = {
  slot: true,
  user: {
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  },
  thankYouNotes: {
    include: {
      recipientUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  },
} satisfies Prisma.ContributionInclude;

// Create a new meal train
router.post(
  '/',
  authenticate,
  requireVerified,
  [
    body('title').trim().isLength({ min: 1, max: 200 }),
    body('recipientName').trim().isLength({ min: 1, max: 200 }),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const {
      title,
      description,
      story,
      coverImage,
      recipientName,
      recipientEmail,
      recipientPhone,
      recipientAddress,
      recipientCity,
      recipientState,
      recipientZip,
      recipientCountry,
      dietaryPreferences,
      allergies,
      foodLikes,
      foodDislikes,
      deliveryInstructions,
      householdSize,
      startDate,
      endDate,
      defaultDeliveryTime,
      timezone,
      isPublic,
      allowDonations,
      allowGiftCards,
      donationGoal,
      requireApproval,
      showParticipantList,
      enableReminders,
      reminderHours,
      trainType,
      category,
      dates,
      requireMilchigFleishig,
      acceptsMilchig,
      acceptsFleishig,
      acceptsPareve,
      requireCholovYisroel,
      requirePasYisroel,
      requireYoshon,
      requireGlatt,
      allergyNuts,
      allergyDairy,
      allergyGluten,
      allergyEggs,
      allergyFish,
      allergyShellfish,
      allergySoy,
      allergyOther,
      allowNonMealTasks,
    } = req.body;

    const slug = generateSlug(title);

    const train = await prisma.mealTrain.create({
      data: {
        slug,
        title,
        description,
        story,
        coverImage,
        recipientName,
        recipientEmail,
        recipientPhone,
        recipientAddress,
        recipientCity,
        recipientState,
        recipientZip,
        recipientCountry: recipientCountry || 'USA',
        dietaryPreferences,
        allergies,
        foodLikes,
        foodDislikes,
        deliveryInstructions,
        householdSize: householdSize || 1,
        requireMilchigFleishig: requireMilchigFleishig ?? true,
        acceptsMilchig: acceptsMilchig ?? true,
        acceptsFleishig: acceptsFleishig ?? true,
        acceptsPareve: acceptsPareve ?? true,
        requireCholovYisroel: requireCholovYisroel ?? false,
        requirePasYisroel: requirePasYisroel ?? false,
        requireYoshon: requireYoshon ?? false,
        requireGlatt: requireGlatt ?? true,
        allergyNuts: allergyNuts ?? false,
        allergyDairy: allergyDairy ?? false,
        allergyGluten: allergyGluten ?? false,
        allergyEggs: allergyEggs ?? false,
        allergyFish: allergyFish ?? false,
        allergyShellfish: allergyShellfish ?? false,
        allergySoy: allergySoy ?? false,
        allergyOther,
        allowNonMealTasks: allowNonMealTasks ?? false,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        defaultDeliveryTime: defaultDeliveryTime || '18:00',
        timezone: timezone || req.user!.timezone,
        isPublic: isPublic ?? false,
        allowDonations: allowDonations ?? true,
        allowGiftCards: allowGiftCards ?? true,
        donationGoal: donationGoal ? parseFloat(donationGoal) : null,
        requireApproval: requireApproval ?? false,
        showParticipantList: showParticipantList ?? true,
        enableReminders: enableReminders ?? true,
        reminderHours: reminderHours || 24,
        trainType: trainType || TrainType.STANDARD,
        category: category || TrainCategory.OTHER,
        organizerId: req.user!.id,
        status: TrainStatus.ACTIVE,
      },
    });

    if (dates && Array.isArray(dates)) {
      await prisma.mealDate.createMany({
        data: dates.map((d: any) => ({
          trainId: train.id,
          date: new Date(d.date),
          deliveryTime: d.deliveryTime || defaultDeliveryTime || '18:00',
          maxParticipants: d.maxParticipants || (trainType === TrainType.POTLUCK ? 5 : 1),
          notes: d.notes,
          status: DateStatus.AVAILABLE,
        })),
      });
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const datesToCreate = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        datesToCreate.push({
          trainId: train.id,
          date: new Date(d),
          deliveryTime: defaultDeliveryTime || '18:00',
          maxParticipants: trainType === TrainType.POTLUCK ? 5 : 1,
          status: DateStatus.AVAILABLE,
        });
      }

      await prisma.mealDate.createMany({ data: datesToCreate });
    }

    const completeTrain = await prisma.mealTrain.findUnique({
      where: { id: train.id },
      include: {
        dates: {
          orderBy: { date: 'asc' },
        },
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json({ train: completeTrain });
  })
);

// Get meal train by slug or id (public view)
router.get(
  '/:slug',
  optionalAuth,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;

    const train = await findTrainByIdentifier(slug, {
      organizer: {
        select: { id: true, firstName: true, lastName: true },
      },
      dates: {
        orderBy: { date: 'asc' },
        include: {
          participants: {
            where: { status: { in: ['CONFIRMED', 'PENDING'] } },
            select: {
              id: true,
              mealDescription: true,
              status: true,
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
              guestName: true,
            },
          },
        },
      },
      taskSlots: {
        orderBy: { date: 'asc' },
        include: {
          contributions: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      },
      contributions: {
        include: contributionInclude,
        orderBy: { createdAt: 'asc' },
      },
      simchaContributions: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: {
          donations: { where: { status: 'COMPLETED' } },
          participants: { where: { status: 'CONFIRMED' } },
          contributions: { where: { status: 'CONFIRMED' } },
          taskSlots: true,
          simchaContributions: true,
        },
      },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const isOrganizer = req.user?.id === train.organizerId;
    const isAdmin = req.user
      ? await prisma.trainAdmin.findFirst({
          where: { trainId: train.id, userId: req.user.id },
        })
      : null;

    let donationTotal = null;
    if (train.allowDonations) {
      const result = await prisma.donation.aggregate({
        where: { trainId: train.id, status: 'COMPLETED' },
        _sum: { amount: true },
      });
      donationTotal = result._sum.amount;
    }

    const response = {
      ...train,
      recipientEmail: isOrganizer || isAdmin ? train.recipientEmail : undefined,
      recipientPhone: isOrganizer || isAdmin ? train.recipientPhone : undefined,
      donationTotal,
      isOrganizer,
      isAdmin: !!isAdmin,
    };

    res.json({ train: response });
  })
);

// Update meal train
router.patch(
  '/:slug',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;

    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!isOrganizerOrAdmin(train, req.user!.id)) {
      throw new AppError('Not authorized to update this meal train', 403);
    }

    const allowedFields = [
      'title', 'description', 'story', 'coverImage',
      'recipientName', 'recipientEmail', 'recipientPhone',
      'recipientAddress', 'recipientCity', 'recipientState', 'recipientZip',
      'dietaryPreferences', 'allergies', 'foodLikes', 'foodDislikes',
      'deliveryInstructions', 'householdSize',
      'defaultDeliveryTime', 'timezone',
      'isPublic', 'allowDonations', 'allowGiftCards', 'donationGoal',
      'requireApproval', 'showParticipantList',
      'enableReminders', 'reminderHours',
      'status', 'trainType', 'category',
      'requireMilchigFleishig', 'acceptsMilchig', 'acceptsFleishig', 'acceptsPareve',
      'requireCholovYisroel', 'requirePasYisroel', 'requireYoshon', 'requireGlatt',
      'allergyNuts', 'allergyDairy', 'allergyGluten', 'allergyEggs', 'allergyFish',
      'allergyShellfish', 'allergySoy', 'allergyOther',
      'allowNonMealTasks',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.donationGoal) {
      updateData.donationGoal = parseFloat(updateData.donationGoal);
    }

    const updatedTrain = await prisma.mealTrain.update({
      where: { id: train.id },
      data: updateData,
      include: {
        dates: { orderBy: { date: 'asc' } },
        organizer: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.json({ train: updatedTrain });
  })
);

// Delete meal train
router.delete(
  '/:slug',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;

    const train = await findTrainByIdentifier(slug);

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (req.user!.id !== train.organizerId) {
      throw new AppError('Only the organizer can delete this meal train', 403);
    }

    await prisma.mealTrain.delete({ where: { id: train.id } });

    res.json({ message: 'Meal train deleted successfully' });
  })
);

// Add/update dates
router.post(
  '/:slug/dates',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;
    const { dates } = req.body;

    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!isOrganizerOrAdmin(train, req.user!.id)) {
      throw new AppError('Not authorized', 403);
    }

    if (!Array.isArray(dates)) {
      throw new AppError('Dates must be an array', 400);
    }

    const createdDates = await prisma.$transaction(
      dates.map((d: any) =>
        prisma.mealDate.upsert({
          where: {
            trainId_date: {
              trainId: train.id,
              date: new Date(d.date),
            },
          },
          create: {
            trainId: train.id,
            date: new Date(d.date),
            deliveryTime: d.deliveryTime || train.defaultDeliveryTime,
            maxParticipants: d.maxParticipants || 1,
            notes: d.notes,
            status: d.status || DateStatus.AVAILABLE,
          },
          update: {
            deliveryTime: d.deliveryTime,
            maxParticipants: d.maxParticipants,
            notes: d.notes,
            status: d.status,
          },
        })
      )
    );

    res.json({ dates: createdDates });
  })
);

// Update a specific date
router.patch(
  '/:slug/dates/:dateId',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug, dateId } = req.params;

    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!isOrganizerOrAdmin(train, req.user!.id)) {
      throw new AppError('Not authorized', 403);
    }

    const { deliveryTime, maxParticipants, notes, status } = req.body;

    const updatedDate = await prisma.mealDate.update({
      where: { id: dateId },
      data: {
        ...(deliveryTime && { deliveryTime }),
        ...(maxParticipants && { maxParticipants }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
      include: {
        participants: true,
      },
    });

    res.json({ date: updatedDate });
  })
);

// Delete a date
router.delete(
  '/:slug/dates/:dateId',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug, dateId } = req.params;

    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!isOrganizerOrAdmin(train, req.user!.id)) {
      throw new AppError('Not authorized', 403);
    }

    await prisma.mealDate.delete({ where: { id: dateId } });

    res.json({ message: 'Date deleted successfully' });
  })
);

// Get task slots for a train
router.get(
  '/:slug/task-slots',
  optionalAuth,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;
    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const isAuthorized = req.user
      ? isOrganizerOrAdmin(train, req.user.id) || train.isPublic
      : train.isPublic;

    if (!isAuthorized) {
      throw new AppError('Not authorized', 403);
    }

    const taskSlots = await prisma.taskSlot.findMany({
      where: { trainId: train.id },
      include: {
        contributions: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ date: 'asc' }, { taskType: 'asc' }],
    });

    res.json({ taskSlots });
  })
);

// Create or fetch a task slot
router.post(
  '/:slug/task-slots',
  optionalAuth,
  [
    body('date').isISO8601(),
    body('taskType').optional().isString(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { slug } = req.params;
    const { date, taskType, allowSplit, maxContributors, taskTitle, taskDescription, estimatedDuration, location, notes, startTime, endTime } = req.body;

    const train = await findTrainByIdentifier(slug, { admins: true });
    if (!train) throw new AppError('Meal train not found', 404);

    const isAuthorized = req.user ? isOrganizerOrAdmin(train, req.user.id) : true;
    if (!isAuthorized && !train.isPublic) {
      throw new AppError('Not authorized', 403);
    }

    const slot = await prisma.taskSlot.upsert({
      where: {
        trainId_date_taskType: {
          trainId: train.id,
          date: new Date(date),
          taskType: (taskType as TaskType) || TaskType.MEAL_DINNER,
        },
      },
      create: {
        trainId: train.id,
        date: new Date(date),
        taskType: (taskType as TaskType) || TaskType.MEAL_DINNER,
        allowSplit: allowSplit ?? false,
        maxContributors: maxContributors || 1,
        taskTitle,
        taskDescription,
        estimatedDuration,
        location,
        notes,
        startTime,
        endTime,
        status: SlotStatus.AVAILABLE,
      },
      update: {
        allowSplit,
        maxContributors,
        taskTitle,
        taskDescription,
        estimatedDuration,
        location,
        notes,
        startTime,
        endTime,
      },
      include: {
        contributions: true,
      },
    });

    res.status(201).json(slot);
  })
);

router.get(
  '/:slug/task-slots/:slotId',
  optionalAuth,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug, slotId } = req.params;
    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const slot = await prisma.taskSlot.findUnique({
      where: { id: slotId },
      include: {
        contributions: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!slot || slot.trainId !== train.id) {
      throw new AppError('Task slot not found', 404);
    }

    res.json({ taskSlot: slot });
  })
);

router.patch(
  '/:slug/task-slots/:slotId',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug, slotId } = req.params;
    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!isOrganizerOrAdmin(train, req.user!.id)) {
      throw new AppError('Not authorized', 403);
    }

    const taskSlot = await prisma.taskSlot.findUnique({ where: { id: slotId } });
    if (!taskSlot || taskSlot.trainId !== train.id) {
      throw new AppError('Task slot not found', 404);
    }

    const updated = await prisma.taskSlot.update({
      where: { id: taskSlot.id },
      data: {
        date: req.body.date ? new Date(req.body.date) : undefined,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        taskType: req.body.taskType,
        allowSplit: req.body.allowSplit,
        maxContributors: req.body.maxContributors,
        taskTitle: req.body.taskTitle,
        taskDescription: req.body.taskDescription,
        estimatedDuration: req.body.estimatedDuration,
        location: req.body.location,
        notes: req.body.notes,
        status: req.body.status,
      },
      include: {
        contributions: true,
      },
    });

    res.json({ taskSlot: updated });
  })
);

router.delete(
  '/:slug/task-slots/:slotId',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug, slotId } = req.params;
    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!isOrganizerOrAdmin(train, req.user!.id)) {
      throw new AppError('Not authorized', 403);
    }

    const taskSlot = await prisma.taskSlot.findUnique({ where: { id: slotId } });
    if (!taskSlot || taskSlot.trainId !== train.id) {
      throw new AppError('Task slot not found', 404);
    }

    await prisma.taskSlot.delete({ where: { id: taskSlot.id } });
    res.json({ message: 'Task slot deleted successfully' });
  })
);

router.get(
  '/:slug/contributions',
  optionalAuth,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;
    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const isAuthorized = req.user
      ? isOrganizerOrAdmin(train, req.user.id) || train.isPublic
      : train.isPublic;

    if (!isAuthorized) {
      throw new AppError('Not authorized', 403);
    }

    const contributions = await prisma.contribution.findMany({
      where: { trainId: train.id },
      include: contributionInclude,
      orderBy: { createdAt: 'asc' },
    });

    res.json({ contributions });
  })
);

// Sign up for a task slot (create contribution)
router.post(
  '/:slug/contributions',
  optionalAuth,
  [
    body('slotId').notEmpty(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { slug } = req.params;
    const {
      slotId,
      mealComponent,
      mealCategory,
      isCholovYisroel,
      isPasYisroel,
      isYoshon,
      isGlatt,
      allergyInfo,
      itemDescription,
      notes,
      guestName,
      guestEmail,
      guestPhone,
    } = req.body;

    const train = await findTrainByIdentifier(slug);
    if (!train) throw new AppError('Meal train not found', 404);

    const slot = await prisma.taskSlot.findUnique({
      where: { id: slotId },
      include: { contributions: { where: { status: { in: ['CONFIRMED', 'PENDING'] } } } },
    });

    if (!slot || slot.trainId !== train.id) {
      throw new AppError('Task slot not found', 404);
    }

    const closedStatuses: SlotStatus[] = [SlotStatus.CLOSED, SlotStatus.CANCELLED];
    if (closedStatuses.includes(slot.status)) {
      throw new AppError('This slot is not available', 400);
    }

    if (!req.user && !guestName) {
      throw new AppError('Guest name is required', 400);
    }
    if (!req.user && !guestEmail) {
      throw new AppError('Guest email is required', 400);
    }

    const status = train.requireApproval
      ? ContributionStatus.PENDING
      : ContributionStatus.CONFIRMED;

    const contribution = await prisma.contribution.create({
      data: {
        slotId: slot.id,
        trainId: train.id,
        userId: req.user?.id,
        guestName: req.user ? null : guestName,
        guestEmail: req.user ? null : guestEmail,
        guestPhone: req.user ? null : guestPhone,
        mealComponent,
        mealCategory: mealCategory as MealCategory | undefined,
        isCholovYisroel: isCholovYisroel ?? false,
        isPasYisroel: isPasYisroel ?? false,
        isYoshon: isYoshon ?? false,
        isGlatt: isGlatt ?? true,
        allergyInfo,
        itemDescription,
        notes,
        status,
      },
      include: contributionInclude,
    });

    const totalContributions = slot.contributions.length + 1;
    const shouldFill = totalContributions >= slot.maxContributors;
    const nextStatus = shouldFill
      ? SlotStatus.FILLED
      : slot.allowSplit
        ? SlotStatus.PARTIALLY_FILLED
        : SlotStatus.FILLED;

    await prisma.taskSlot.update({
      where: { id: slot.id },
      data: { status: nextStatus },
    });

    res.status(201).json({ contribution });
  })
);

router.get(
  '/:slug/thank-you',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;
    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!isOrganizerOrAdmin(train, req.user!.id)) {
      throw new AppError('Not authorized', 403);
    }

    const notes = await prisma.thankYouNote.findMany({
      where: { trainId: train.id },
      include: {
        contribution: {
          include: contributionInclude,
        },
        recipientUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ notes });
  })
);

router.post(
  '/:slug/thank-you',
  authenticate,
  [
    body('message').trim().isLength({ min: 1, max: 2000 }),
    body('contributionId').optional().isString(),
    body('recipientUserId').optional().isString(),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { slug } = req.params;
    const { contributionId, recipientUserId, message } = req.body;
    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!isOrganizerOrAdmin(train, req.user!.id)) {
      throw new AppError('Not authorized', 403);
    }

    if (!contributionId && !recipientUserId) {
      throw new AppError('Contribution or recipient is required', 400);
    }

    let resolvedContributionId: string | null = null;
    let resolvedRecipientUserId = recipientUserId as string | undefined;

    if (contributionId) {
      const contribution = await prisma.contribution.findUnique({
        where: { id: contributionId },
        include: { user: true },
      });

      if (!contribution || contribution.trainId !== train.id) {
        throw new AppError('Contribution not found', 404);
      }

      if (!contribution.userId) {
        throw new AppError('Thank-you notes can only be sent to registered contributors', 400);
      }

      resolvedContributionId = contribution.id;
      resolvedRecipientUserId = contribution.userId;
    }

    if (!resolvedRecipientUserId) {
      throw new AppError('Recipient is required', 400);
    }

    const note = await prisma.thankYouNote.create({
      data: {
        trainId: train.id,
        contributionId: resolvedContributionId,
        recipientUserId: resolvedRecipientUserId,
        message,
      },
      include: {
        contribution: {
          include: contributionInclude,
        },
        recipientUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: resolvedRecipientUserId,
        trainId: train.id,
        type: 'ADMIN_MESSAGE',
        title: 'New thank-you note',
        message,
        data: {
          noteId: note.id,
          contributionId: resolvedContributionId,
          trainSlug: train.slug,
        },
      },
    });

    res.status(201).json({ note });
  })
);

// Simcha contributions
router.get(
  '/:slug/simcha-contributions',
  optionalAuth,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;
    const train = await findTrainByIdentifier(slug);
    if (!train) throw new AppError('Meal train not found', 404);

    const contributions = await prisma.simchaContribution.findMany({
      where: { trainId: train.id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ contributions });
  })
);

router.post(
  '/:slug/simcha-contributions',
  optionalAuth,
  [
    body('itemCategory').isString(),
    body('itemDescription').isString().isLength({ min: 1 }),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { slug } = req.params;
    const {
      itemCategory,
      itemDescription,
      servings,
      quantity,
      mealCategory,
      isCholovYisroel,
      isPasYisroel,
      isYoshon,
      isGlatt,
      notes,
      guestName,
      guestEmail,
      guestPhone,
    } = req.body;

    const train = await findTrainByIdentifier(slug);
    if (!train) throw new AppError('Meal train not found', 404);
    if (train.trainType !== TrainType.SIMCHA) {
      throw new AppError('Simcha contributions are only available for SIMCHA trains', 400);
    }

    if (!req.user && !guestName) {
      throw new AppError('Guest name is required', 400);
    }
    if (!req.user && !guestEmail) {
      throw new AppError('Guest email is required', 400);
    }

    const contribution = await prisma.simchaContribution.create({
      data: {
        trainId: train.id,
        userId: req.user?.id,
        guestName: req.user ? null : guestName,
        guestEmail: req.user ? null : guestEmail,
        guestPhone: req.user ? null : guestPhone,
        itemCategory: itemCategory as SimchaItemCategory,
        itemDescription,
        servings,
        quantity,
        mealCategory: mealCategory as MealCategory | undefined,
        isCholovYisroel: isCholovYisroel ?? false,
        isPasYisroel: isPasYisroel ?? false,
        isYoshon: isYoshon ?? false,
        isGlatt: isGlatt ?? true,
        notes,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    res.status(201).json({ contribution });
  })
);

router.patch(
  '/:slug/simcha-contributions/:id',
  optionalAuth,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug, id } = req.params;
    const { guestEmail, guestPhone, ...updateData } = req.body;

    const train = await findTrainByIdentifier(slug, { admins: true });
    if (!train) throw new AppError('Meal train not found', 404);

    const contribution = await prisma.simchaContribution.findUnique({
      where: { id },
    });
    if (!contribution || contribution.trainId !== train.id) {
      throw new AppError('Contribution not found', 404);
    }

    const isOwner = req.user && contribution.userId === req.user.id;
    const isAuthorized = req.user
      ? isOwner || isOrganizerOrAdmin(train, req.user.id)
      : Boolean(contribution.guestEmail && guestEmail && contribution.guestEmail === guestEmail) ||
        Boolean(contribution.guestPhone && guestPhone && contribution.guestPhone === guestPhone);

    if (!isAuthorized) {
      throw new AppError('Not authorized', 403);
    }

    const updated = await prisma.simchaContribution.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    res.json({ contribution: updated });
  })
);

router.delete(
  '/:slug/simcha-contributions/:id',
  optionalAuth,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug, id } = req.params;
    const { guestEmail, guestPhone } = req.body || {};

    const train = await findTrainByIdentifier(slug, { admins: true });
    if (!train) throw new AppError('Meal train not found', 404);

    const contribution = await prisma.simchaContribution.findUnique({ where: { id } });
    if (!contribution || contribution.trainId !== train.id) {
      throw new AppError('Contribution not found', 404);
    }

    const isOwner = req.user && contribution.userId === req.user.id;
    const isAuthorized = req.user
      ? isOwner || isOrganizerOrAdmin(train, req.user.id)
      : Boolean(contribution.guestEmail && guestEmail && contribution.guestEmail === guestEmail) ||
        Boolean(contribution.guestPhone && guestPhone && contribution.guestPhone === guestPhone);

    if (!isAuthorized) {
      throw new AppError('Not authorized', 403);
    }

    await prisma.simchaContribution.delete({ where: { id } });
    res.json({ message: 'Contribution deleted successfully' });
  })
);

// Add admin to meal train
router.post(
  '/:slug/admins',
  authenticate,
  [body('email').isEmail()],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;
    const { email, role } = req.body;

    const train = await findTrainByIdentifier(slug);

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (req.user!.id !== train.organizerId) {
      throw new AppError('Only the organizer can add admins', 403);
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      throw new AppError('User not found', 404);
    }

    const admin = await prisma.trainAdmin.create({
      data: {
        trainId: train.id,
        userId: userToAdd.id,
        role: role || 'ADMIN',
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    res.json({ admin });
  })
);

// Remove admin
router.delete(
  '/:slug/admins/:userId',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug, userId } = req.params;

    const train = await findTrainByIdentifier(slug);

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (req.user!.id !== train.organizerId) {
      throw new AppError('Only the organizer can remove admins', 403);
    }

    await prisma.trainAdmin.deleteMany({
      where: { trainId: train.id, userId },
    });

    res.json({ message: 'Admin removed successfully' });
  })
);

// Get train analytics
router.get(
  '/:slug/analytics',
  authenticate,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;

    const train = await findTrainByIdentifier(slug, { admins: true });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    if (!isOrganizerOrAdmin(train, req.user!.id)) {
      throw new AppError('Not authorized', 403);
    }

    const [
      totalDates,
      filledDates,
      totalParticipants,
      donationStats,
      giftCardStats,
      totalTaskSlots,
      totalContributions,
      totalSimchaContributions,
    ] = await Promise.all([
      prisma.mealDate.count({ where: { trainId: train.id } }),
      prisma.mealDate.count({ where: { trainId: train.id, status: 'FILLED' } }),
      prisma.participant.count({
        where: { trainId: train.id, status: 'CONFIRMED' },
      }),
      prisma.donation.aggregate({
        where: { trainId: train.id, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.giftCard.aggregate({
        where: { trainId: train.id, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.taskSlot.count({ where: { trainId: train.id } }),
      prisma.contribution.count({ where: { trainId: train.id, status: 'CONFIRMED' } }),
      prisma.simchaContribution.count({ where: { trainId: train.id } }),
    ]);

    res.json({
      analytics: {
        totalDates,
        filledDates,
        availableDates: totalDates - filledDates,
        fillRate: totalDates > 0 ? (filledDates / totalDates) * 100 : 0,
        totalParticipants,
        totalDonations: donationStats._count,
        donationAmount: donationStats._sum.amount || 0,
        totalGiftCards: giftCardStats._count,
        giftCardAmount: giftCardStats._sum.amount || 0,
        totalTaskSlots,
        totalContributions,
        totalSimchaContributions,
      },
    });
  })
);

// Search/find public trains
router.get(
  '/',
  optionalAuth,
  [
    query('q').optional().isString(),
    query('category').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { q, category, page = 1, limit = 20 } = req.query;

    const where: any = {
      isPublic: true,
      status: TrainStatus.ACTIVE,
    };

    if (q && typeof q === 'string') {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { recipientName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category && typeof category === 'string') {
      where.category = category as TrainCategory;
    }

    const [trains, total] = await Promise.all([
      prisma.mealTrain.findMany({
        where,
        include: {
          organizer: {
            select: { firstName: true, lastName: true },
          },
          _count: {
            select: {
              dates: true,
              participants: { where: { status: 'CONFIRMED' } },
              contributions: { where: { status: 'CONFIRMED' } },
              taskSlots: true,
              simchaContributions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.mealTrain.count({ where }),
    ]);

    res.json({
      trains,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  })
);

export default router;
