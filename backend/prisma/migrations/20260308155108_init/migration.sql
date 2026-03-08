-- CreateEnum
CREATE TYPE "TrainType" AS ENUM ('STANDARD', 'POTLUCK', 'FULL_CHESED', 'SIMCHA', 'EVENT');

-- CreateEnum
CREATE TYPE "TrainStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TrainCategory" AS ENUM ('NEW_BABY', 'ILLNESS', 'SURGERY', 'LOSS', 'INJURY', 'SHIVA', 'SIMCHA', 'KIDDUSH', 'COMMUNITY_EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "DateStatus" AS ENUM ('AVAILABLE', 'FILLED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('MEAL_BREAKFAST', 'MEAL_LUNCH', 'MEAL_DINNER', 'MEAL_SHABBOS_FRIDAY_NIGHT', 'MEAL_SHABBOS_DAY', 'MEAL_SEUDAH_SHLISHIS', 'BABYSITTING', 'HOSPITAL_VISIT', 'RIDES', 'GROCERY_RUN', 'ERRANDS', 'LAUNDRY', 'HOUSEHOLD_HELP', 'DOG_WALKING', 'CHILDCARE_PICKUP', 'OTHER_TASK');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'PARTIALLY_FILLED', 'FILLED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MealComponent" AS ENUM ('FULL_MEAL', 'PROTEIN_MAIN', 'SIDES', 'SALAD', 'SOUP', 'DESSERT', 'DRINKS', 'BREAD_CHALLAH', 'APPETIZER', 'KUGEL', 'OTHER');

-- CreateEnum
CREATE TYPE "MealCategory" AS ENUM ('MILCHIG', 'FLEISHIG', 'PAREVE');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('NOT_STARTED', 'PREPARING', 'LEAVING_NOW', 'EN_ROUTE', 'ARRIVING_SOON', 'DELIVERED');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "SimchaItemCategory" AS ENUM ('APPETIZER', 'MAIN_DISH', 'SIDE_DISH', 'SALAD', 'SOUP', 'KUGEL', 'CHALLAH_BREAD', 'DESSERT', 'DRINKS', 'SNACKS', 'PAPER_GOODS', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRAIN_CREATED', 'TRAIN_UPDATED', 'TRAIN_COMPLETED', 'CONTRIBUTION_SIGNED_UP', 'CONTRIBUTION_CANCELLED', 'CONTRIBUTION_REMINDER', 'DAY_OF_CONFIRMATION_REQUEST', 'MILCHIG_FLEISHIG_CONFIRMED', 'DELIVERY_STATUS_UPDATE', 'DELIVERY_ARRIVING', 'DELIVERY_COMPLETED', 'DONATION_RECEIVED', 'GIFT_CARD_RECEIVED', 'SIMCHA_CONTRIBUTION_ADDED', 'REMINDER', 'ADMIN_MESSAGE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_providers" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_sessions" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "identifierType" TEXT NOT NULL,
    "verificationCode" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chesed_trains" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "story" TEXT,
    "coverImage" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "recipientAddress" TEXT,
    "recipientCity" TEXT,
    "recipientState" TEXT,
    "recipientZip" TEXT,
    "recipientCountry" TEXT NOT NULL DEFAULT 'USA',
    "dietaryPreferences" TEXT,
    "allergies" TEXT,
    "foodLikes" TEXT,
    "foodDislikes" TEXT,
    "deliveryInstructions" TEXT,
    "householdSize" INTEGER NOT NULL DEFAULT 1,
    "requireMilchigFleishig" BOOLEAN NOT NULL DEFAULT true,
    "acceptsMilchig" BOOLEAN NOT NULL DEFAULT true,
    "acceptsFleishig" BOOLEAN NOT NULL DEFAULT true,
    "acceptsPareve" BOOLEAN NOT NULL DEFAULT true,
    "requireCholovYisroel" BOOLEAN NOT NULL DEFAULT false,
    "requirePasYisroel" BOOLEAN NOT NULL DEFAULT false,
    "requireYoshon" BOOLEAN NOT NULL DEFAULT false,
    "requireGlatt" BOOLEAN NOT NULL DEFAULT true,
    "allergyNuts" BOOLEAN NOT NULL DEFAULT false,
    "allergyDairy" BOOLEAN NOT NULL DEFAULT false,
    "allergyGluten" BOOLEAN NOT NULL DEFAULT false,
    "allergyEggs" BOOLEAN NOT NULL DEFAULT false,
    "allergyFish" BOOLEAN NOT NULL DEFAULT false,
    "allergyShellfish" BOOLEAN NOT NULL DEFAULT false,
    "allergySoy" BOOLEAN NOT NULL DEFAULT false,
    "allergyOther" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "defaultDeliveryTime" TEXT NOT NULL DEFAULT '18:00',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "allowDonations" BOOLEAN NOT NULL DEFAULT true,
    "allowGiftCards" BOOLEAN NOT NULL DEFAULT true,
    "donationGoal" DECIMAL(10,2),
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "showParticipantList" BOOLEAN NOT NULL DEFAULT true,
    "enableReminders" BOOLEAN NOT NULL DEFAULT true,
    "reminderHours" INTEGER NOT NULL DEFAULT 24,
    "allowNonMealTasks" BOOLEAN NOT NULL DEFAULT false,
    "trainType" "TrainType" NOT NULL DEFAULT 'STANDARD',
    "status" "TrainStatus" NOT NULL DEFAULT 'ACTIVE',
    "category" "TrainCategory" NOT NULL DEFAULT 'OTHER',
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chesed_trains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "train_admins" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "train_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_dates" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "deliveryTime" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "status" "DateStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "dateId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "mealDescription" TEXT,
    "notes" TEXT,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_slots" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "taskType" "TaskType" NOT NULL DEFAULT 'MEAL_DINNER',
    "allowSplit" BOOLEAN NOT NULL DEFAULT false,
    "maxContributors" INTEGER NOT NULL DEFAULT 1,
    "taskTitle" TEXT,
    "taskDescription" TEXT,
    "estimatedDuration" INTEGER,
    "location" TEXT,
    "notes" TEXT,
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "guestVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "mealComponent" "MealComponent" NOT NULL DEFAULT 'FULL_MEAL',
    "mealCategory" "MealCategory",
    "isCholovYisroel" BOOLEAN NOT NULL DEFAULT false,
    "isPasYisroel" BOOLEAN NOT NULL DEFAULT false,
    "isYoshon" BOOLEAN NOT NULL DEFAULT false,
    "isGlatt" BOOLEAN NOT NULL DEFAULT true,
    "allergyInfo" TEXT,
    "confirmedMealCategory" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "dayOfReminderSent" BOOLEAN NOT NULL DEFAULT false,
    "dayOfReminderSentAt" TIMESTAMP(3),
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "deliveryStatusUpdatedAt" TIMESTAMP(3),
    "estimatedArrival" TIMESTAMP(3),
    "itemDescription" TEXT,
    "notes" TEXT,
    "status" "ContributionStatus" NOT NULL DEFAULT 'CONFIRMED',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simcha_contributions" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "guestPhone" TEXT,
    "guestEmail" TEXT,
    "itemCategory" "SimchaItemCategory" NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "servings" INTEGER,
    "quantity" TEXT,
    "mealCategory" "MealCategory",
    "isCholovYisroel" BOOLEAN NOT NULL DEFAULT false,
    "isPasYisroel" BOOLEAN NOT NULL DEFAULT false,
    "isYoshon" BOOLEAN NOT NULL DEFAULT false,
    "isGlatt" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simcha_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "userId" TEXT,
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripePaymentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_cards" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "userId" TEXT,
    "purchaserName" TEXT NOT NULL,
    "purchaserEmail" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "vendor" TEXT NOT NULL,
    "code" TEXT,
    "message" TEXT,
    "stripePaymentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "deliveredAt" TIMESTAMP(3),
    "deliveryEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "trainId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "email" TEXT,
    "phone" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thank_you_notes" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "contributionId" TEXT,
    "recipientUserId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thank_you_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_providers_provider_providerId_key" ON "oauth_providers"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "guest_sessions_identifier_identifierType_key" ON "guest_sessions"("identifier", "identifierType");

-- CreateIndex
CREATE UNIQUE INDEX "chesed_trains_slug_key" ON "chesed_trains"("slug");

-- CreateIndex
CREATE INDEX "chesed_trains_slug_idx" ON "chesed_trains"("slug");

-- CreateIndex
CREATE INDEX "chesed_trains_organizerId_idx" ON "chesed_trains"("organizerId");

-- CreateIndex
CREATE UNIQUE INDEX "train_admins_trainId_userId_key" ON "train_admins"("trainId", "userId");

-- CreateIndex
CREATE INDEX "meal_dates_trainId_idx" ON "meal_dates"("trainId");

-- CreateIndex
CREATE UNIQUE INDEX "meal_dates_trainId_date_key" ON "meal_dates"("trainId", "date");

-- CreateIndex
CREATE INDEX "participants_trainId_idx" ON "participants"("trainId");

-- CreateIndex
CREATE INDEX "participants_dateId_idx" ON "participants"("dateId");

-- CreateIndex
CREATE INDEX "participants_userId_idx" ON "participants"("userId");

-- CreateIndex
CREATE INDEX "task_slots_trainId_date_idx" ON "task_slots"("trainId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "task_slots_trainId_date_taskType_key" ON "task_slots"("trainId", "date", "taskType");

-- CreateIndex
CREATE INDEX "contributions_slotId_idx" ON "contributions"("slotId");

-- CreateIndex
CREATE INDEX "contributions_trainId_idx" ON "contributions"("trainId");

-- CreateIndex
CREATE INDEX "contributions_userId_idx" ON "contributions"("userId");

-- CreateIndex
CREATE INDEX "simcha_contributions_trainId_idx" ON "simcha_contributions"("trainId");

-- CreateIndex
CREATE INDEX "donations_trainId_idx" ON "donations"("trainId");

-- CreateIndex
CREATE INDEX "gift_cards_trainId_idx" ON "gift_cards"("trainId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_trainId_idx" ON "notifications"("trainId");

-- CreateIndex
CREATE INDEX "thank_you_notes_trainId_idx" ON "thank_you_notes"("trainId");

-- CreateIndex
CREATE INDEX "thank_you_notes_contributionId_idx" ON "thank_you_notes"("contributionId");

-- CreateIndex
CREATE INDEX "thank_you_notes_recipientUserId_idx" ON "thank_you_notes"("recipientUserId");

-- AddForeignKey
ALTER TABLE "oauth_providers" ADD CONSTRAINT "oauth_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chesed_trains" ADD CONSTRAINT "chesed_trains_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_admins" ADD CONSTRAINT "train_admins_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "chesed_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "train_admins" ADD CONSTRAINT "train_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_dates" ADD CONSTRAINT "meal_dates_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "chesed_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "chesed_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "meal_dates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_slots" ADD CONSTRAINT "task_slots_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "chesed_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "task_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "chesed_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simcha_contributions" ADD CONSTRAINT "simcha_contributions_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "chesed_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simcha_contributions" ADD CONSTRAINT "simcha_contributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "chesed_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "chesed_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "chesed_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thank_you_notes" ADD CONSTRAINT "thank_you_notes_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "chesed_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thank_you_notes" ADD CONSTRAINT "thank_you_notes_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "contributions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thank_you_notes" ADD CONSTRAINT "thank_you_notes_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
