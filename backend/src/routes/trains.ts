import { Router, Response } from 'express';
import prisma from '../config/database.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth, AuthRequest, requireVerified } from '../middleware/auth.js';
import { generateSlug } from '../utils/slug.js';
import { body, param, query, validationResult } from 'express-validator';
import { TrainStatus, TrainType, TrainCategory, DateStatus } from '@prisma/client';

const router = Router();

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
      dates, // Array of specific dates to create
    } = req.body;

    const slug = generateSlug(title);

    // Create the meal train
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

    // Create dates if provided, otherwise generate from date range
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
      // Generate dates for the entire range
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

    // Fetch the complete train with dates
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

// Get meal train by slug (public view)
router.get(
  '/:slug',
  optionalAuth,
  catchAsync(async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;

    const train = await prisma.mealTrain.findUnique({
      where: { slug },
      include: {
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
        _count: {
          select: {
            donations: { where: { status: 'COMPLETED' } },
            participants: { where: { status: 'CONFIRMED' } },
          },
        },
      },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    // Check if private and user is not organizer/admin/participant
    const isOrganizer = req.user?.id === train.organizerId;
    const isAdmin = req.user ? await prisma.trainAdmin.findFirst({
      where: { trainId: train.id, userId: req.user.id },
    }) : null;

    // For private trains, only allow access with the unique link (slug)
    // The slug itself acts as the access token

    // Calculate donation total if allowed
    let donationTotal = null;
    if (train.allowDonations) {
      const result = await prisma.donation.aggregate({
        where: { trainId: train.id, status: 'COMPLETED' },
        _sum: { amount: true },
      });
      donationTotal = result._sum.amount;
    }

    // Hide sensitive info for non-organizers
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

    const train = await prisma.mealTrain.findUnique({
      where: { slug },
      include: { admins: true },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    // Check authorization
    const isOrganizer = req.user!.id === train.organizerId;
    const isAdmin = train.admins.some(a => a.userId === req.user!.id);

    if (!isOrganizer && !isAdmin) {
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

    const train = await prisma.mealTrain.findUnique({
      where: { slug },
    });

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

    const train = await prisma.mealTrain.findUnique({
      where: { slug },
      include: { admins: true },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const isOrganizer = req.user!.id === train.organizerId;
    const isAdmin = train.admins.some(a => a.userId === req.user!.id);

    if (!isOrganizer && !isAdmin) {
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

    const train = await prisma.mealTrain.findUnique({
      where: { slug },
      include: { admins: true },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const isOrganizer = req.user!.id === train.organizerId;
    const isAdmin = train.admins.some(a => a.userId === req.user!.id);

    if (!isOrganizer && !isAdmin) {
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

    const train = await prisma.mealTrain.findUnique({
      where: { slug },
      include: { admins: true },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const isOrganizer = req.user!.id === train.organizerId;
    const isAdmin = train.admins.some(a => a.userId === req.user!.id);

    if (!isOrganizer && !isAdmin) {
      throw new AppError('Not authorized', 403);
    }

    await prisma.mealDate.delete({ where: { id: dateId } });

    res.json({ message: 'Date deleted successfully' });
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

    const train = await prisma.mealTrain.findUnique({ where: { slug } });

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

    const train = await prisma.mealTrain.findUnique({ where: { slug } });

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

    const train = await prisma.mealTrain.findUnique({
      where: { slug },
      include: { admins: true },
    });

    if (!train) {
      throw new AppError('Meal train not found', 404);
    }

    const isOrganizer = req.user!.id === train.organizerId;
    const isAdmin = train.admins.some(a => a.userId === req.user!.id);

    if (!isOrganizer && !isAdmin) {
      throw new AppError('Not authorized', 403);
    }

    const [
      totalDates,
      filledDates,
      totalParticipants,
      donationStats,
      giftCardStats,
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
