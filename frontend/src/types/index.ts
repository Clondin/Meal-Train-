// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  timezone?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// ============================================
// ENUMS
// ============================================

export type TrainType = 'STANDARD' | 'POTLUCK' | 'FULL_CHESED' | 'SIMCHA' | 'EVENT';

export type TrainStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type TrainCategory =
  | 'NEW_BABY'
  | 'ILLNESS'
  | 'SURGERY'
  | 'LOSS'
  | 'INJURY'
  | 'SHIVA'
  | 'SIMCHA'
  | 'KIDDUSH'
  | 'COMMUNITY_EVENT'
  | 'OTHER';

export type TaskType =
  // Meal types
  | 'MEAL_BREAKFAST'
  | 'MEAL_LUNCH'
  | 'MEAL_DINNER'
  // Shabbos-specific
  | 'MEAL_SHABBOS_FRIDAY_NIGHT'
  | 'MEAL_SHABBOS_DAY'
  | 'MEAL_SEUDAH_SHLISHIS'
  // Non-meal chesed
  | 'BABYSITTING'
  | 'HOSPITAL_VISIT'
  | 'RIDES'
  | 'GROCERY_RUN'
  | 'ERRANDS'
  | 'LAUNDRY'
  | 'HOUSEHOLD_HELP'
  | 'DOG_WALKING'
  | 'CHILDCARE_PICKUP'
  | 'OTHER_TASK';

export type SlotStatus = 'AVAILABLE' | 'PARTIALLY_FILLED' | 'FILLED' | 'CLOSED' | 'CANCELLED';

export type MealComponent =
  | 'FULL_MEAL'
  | 'PROTEIN_MAIN'
  | 'SIDES'
  | 'SALAD'
  | 'SOUP'
  | 'DESSERT'
  | 'DRINKS'
  | 'BREAD_CHALLAH'
  | 'APPETIZER'
  | 'KUGEL'
  | 'OTHER';

export type MealCategory = 'MILCHIG' | 'FLEISHIG' | 'PAREVE';

export type DeliveryStatus =
  | 'NOT_STARTED'
  | 'PREPARING'
  | 'LEAVING_NOW'
  | 'EN_ROUTE'
  | 'ARRIVING_SOON'
  | 'DELIVERED';

export type ContributionStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export type SimchaItemCategory =
  | 'APPETIZER'
  | 'MAIN_DISH'
  | 'SIDE_DISH'
  | 'SALAD'
  | 'SOUP'
  | 'KUGEL'
  | 'CHALLAH_BREAD'
  | 'DESSERT'
  | 'DRINKS'
  | 'SNACKS'
  | 'PAPER_GOODS'
  | 'OTHER';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type NotificationType =
  | 'TRAIN_CREATED'
  | 'TRAIN_UPDATED'
  | 'TRAIN_COMPLETED'
  | 'CONTRIBUTION_SIGNED_UP'
  | 'CONTRIBUTION_CANCELLED'
  | 'CONTRIBUTION_REMINDER'
  | 'DAY_OF_CONFIRMATION_REQUEST'
  | 'MILCHIG_FLEISHIG_CONFIRMED'
  | 'DELIVERY_STATUS_UPDATE'
  | 'DELIVERY_ARRIVING'
  | 'DELIVERY_COMPLETED'
  | 'DONATION_RECEIVED'
  | 'GIFT_CARD_RECEIVED'
  | 'SIMCHA_CONTRIBUTION_ADDED'
  | 'REMINDER'
  | 'ADMIN_MESSAGE';

// ============================================
// CHESED TRAIN TYPES
// ============================================

export interface ChesedTrain {
  id: string;
  slug: string;
  title: string;
  description?: string;
  story?: string;
  coverImage?: string;

  // Recipient info
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  recipientCity?: string;
  recipientState?: string;
  recipientZip?: string;
  recipientCountry?: string;

  // Basic preferences
  dietaryPreferences?: string;
  allergies?: string;
  foodLikes?: string;
  foodDislikes?: string;
  deliveryInstructions?: string;
  householdSize: number;

  // Enhanced Kosher/Dietary Settings
  requireMilchigFleishig: boolean;
  acceptsMilchig: boolean;
  acceptsFleishig: boolean;
  acceptsPareve: boolean;
  requireCholovYisroel: boolean;
  requirePasYisroel: boolean;
  requireYoshon: boolean;
  requireGlatt: boolean;

  // Structured allergies
  allergyNuts: boolean;
  allergyDairy: boolean;
  allergyGluten: boolean;
  allergyEggs: boolean;
  allergyFish: boolean;
  allergyShellfish: boolean;
  allergySoy: boolean;
  allergyOther?: string;

  // Schedule
  startDate: string;
  endDate: string;
  defaultDeliveryTime?: string;
  timezone?: string;

  // Settings
  isPublic: boolean;
  allowDonations: boolean;
  allowGiftCards: boolean;
  donationGoal?: number | string;
  requireApproval: boolean;
  showParticipantList: boolean;
  enableReminders: boolean;
  reminderHours: number;
  allowNonMealTasks: boolean;

  // Type and status
  trainType: TrainType;
  status: TrainStatus;
  category: TrainCategory;

  // Organization
  organizerId: string;
  organizer?: User;

  // Relations
  taskSlots?: TaskSlot[];
  contributions?: Contribution[];
  donations?: Donation[];
  giftCards?: GiftCard[];
  simchaContributions?: SimchaContribution[];

  _count?: {
    contributions?: number;
    donations?: number;
    taskSlots?: number;
    simchaContributions?: number;
  };

  createdAt: string;
  updatedAt: string;
}

export interface CreateChesedTrainData {
  title?: string;
  recipientName: string;
  recipientAddress?: string;
  recipientCity?: string;
  recipientState?: string;
  recipientZip?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  startDate: string;
  endDate: string;
  description?: string;

  // Dietary preferences
  dietaryPreferences?: string;
  allergies?: string;
  foodLikes?: string;
  foodDislikes?: string;
  householdSize?: number;
  defaultDeliveryTime?: string;
  deliveryInstructions?: string;
  coverImage?: string;

  // Kosher settings
  requireMilchigFleishig?: boolean;
  acceptsMilchig?: boolean;
  acceptsFleishig?: boolean;
  acceptsPareve?: boolean;
  requireCholovYisroel?: boolean;
  requirePasYisroel?: boolean;
  requireYoshon?: boolean;
  requireGlatt?: boolean;

  // Structured allergies
  allergyNuts?: boolean;
  allergyDairy?: boolean;
  allergyGluten?: boolean;
  allergyEggs?: boolean;
  allergyFish?: boolean;
  allergyShellfish?: boolean;
  allergySoy?: boolean;
  allergyOther?: string;

  // Settings
  trainType?: TrainType;
  category?: TrainCategory;
  isPublic?: boolean;
  allowDonations?: boolean;
  allowGiftCards?: boolean;
  allowNonMealTasks?: boolean;
  donationGoal?: number | null;
  requireApproval?: boolean;
  showParticipantList?: boolean;
  enableReminders?: boolean;
  reminderHours?: number;
}

export interface UpdateChesedTrainData extends Partial<CreateChesedTrainData> {
  story?: string;
  status?: TrainStatus;
}

// ============================================
// TASK SLOT TYPES
// ============================================

export interface TaskSlot {
  id: string;
  trainId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  taskType: TaskType;
  allowSplit: boolean;
  maxContributors: number;
  taskTitle?: string;
  taskDescription?: string;
  estimatedDuration?: number;
  location?: string;
  notes?: string;
  status: SlotStatus;
  contributions?: Contribution[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskSlotData {
  date: string;
  startTime?: string;
  endTime?: string;
  taskType: TaskType;
  allowSplit?: boolean;
  maxContributors?: number;
  taskTitle?: string;
  taskDescription?: string;
  estimatedDuration?: number;
  location?: string;
  notes?: string;
}

export interface UpdateTaskSlotData extends Partial<CreateTaskSlotData> {
  status?: SlotStatus;
}

// ============================================
// CONTRIBUTION TYPES
// ============================================

export interface Contribution {
  id: string;
  slotId: string;
  slot?: TaskSlot;
  trainId: string;
  train?: ChesedTrain;

  // User or guest
  userId?: string;
  user?: User;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestVerified: boolean;

  // Meal details
  mealComponent: MealComponent;
  mealCategory?: MealCategory;
  isCholovYisroel: boolean;
  isPasYisroel: boolean;
  isYoshon: boolean;
  isGlatt: boolean;
  allergyInfo?: string;

  // Day-of confirmation
  confirmedMealCategory: boolean;
  confirmedAt?: string;
  dayOfReminderSent: boolean;
  dayOfReminderSentAt?: string;

  // Delivery tracking
  deliveryStatus: DeliveryStatus;
  deliveryStatusUpdatedAt?: string;
  estimatedArrival?: string;

  // Description
  itemDescription?: string;
  notes?: string;

  status: ContributionStatus;
  reminderSent: boolean;
  reminderSentAt?: string;
  thankYouNotes?: ThankYouNote[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateContributionData {
  slotId: string;

  // Guest info (if not logged in)
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;

  // Meal details
  mealComponent?: MealComponent;
  mealCategory?: MealCategory;
  isCholovYisroel?: boolean;
  isPasYisroel?: boolean;
  isYoshon?: boolean;
  isGlatt?: boolean;
  allergyInfo?: string;

  itemDescription?: string;
  notes?: string;
}

export interface UpdateContributionData extends Partial<CreateContributionData> {
  confirmedMealCategory?: boolean;
  deliveryStatus?: DeliveryStatus;
  estimatedArrival?: string;
  status?: ContributionStatus;
}

// ============================================
// SIMCHA CONTRIBUTION TYPES
// ============================================

export interface SimchaContribution {
  id: string;
  trainId: string;
  train?: ChesedTrain;
  userId?: string;
  user?: User;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;

  itemCategory: SimchaItemCategory;
  itemDescription: string;
  servings?: number;
  quantity?: string;

  mealCategory?: MealCategory;
  isCholovYisroel: boolean;
  isPasYisroel: boolean;
  isYoshon: boolean;
  isGlatt: boolean;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateSimchaContributionData {
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;

  itemCategory: SimchaItemCategory;
  itemDescription: string;
  servings?: number;
  quantity?: string;

  mealCategory?: MealCategory;
  isCholovYisroel?: boolean;
  isPasYisroel?: boolean;
  isYoshon?: boolean;
  isGlatt?: boolean;

  notes?: string;
}

// ============================================
// DONATION TYPES
// ============================================

export interface Donation {
  id: string;
  trainId: string;
  userId?: string;
  user?: User;
  donorName: string;
  donorEmail?: string;
  isAnonymous: boolean;
  amount: number;
  currency: string;
  stripePaymentId?: string;
  status: PaymentStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationData {
  donorName: string;
  donorEmail?: string;
  isAnonymous?: boolean;
  amount: number;
  message?: string;
}

// ============================================
// GIFT CARD TYPES
// ============================================

export interface GiftCard {
  id: string;
  trainId: string;
  userId?: string;
  user?: User;
  purchaserName: string;
  purchaserEmail: string;
  amount: number;
  currency: string;
  vendor: string;
  code?: string;
  message?: string;
  stripePaymentId?: string;
  status: PaymentStatus;
  deliveredAt?: string;
  deliveryEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGiftCardData {
  purchaserName: string;
  purchaserEmail: string;
  amount: number;
  vendor: string;
  code?: string;
  message?: string;
  deliveryEmail?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  userId?: string;
  trainId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  email?: string;
  phone?: string;
  read: boolean;
  sent: boolean;
  sentAt?: string;
  createdAt: string;
}

export interface ThankYouNote {
  id: string;
  trainId: string;
  contributionId?: string;
  recipientUserId: string;
  recipientUser?: User;
  message: string;
  createdAt: string;
}

// ============================================
// GUEST SESSION TYPES
// ============================================

export interface GuestSession {
  id: string;
  identifier: string;
  identifierType: 'phone' | 'email';
  verified: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface CreateGuestSessionData {
  identifier: string;
  identifierType: 'phone' | 'email';
}

export interface VerifyGuestSessionData {
  identifier: string;
  identifierType: 'phone' | 'email';
  verificationCode: string;
}

// ============================================
// FILE UPLOAD TYPES
// ============================================

export interface UploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

// ============================================
// API ERROR TYPES
// ============================================

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// ============================================
// HELPER TYPES
// ============================================

// Helper to get display labels for task types
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  MEAL_BREAKFAST: 'Breakfast',
  MEAL_LUNCH: 'Lunch',
  MEAL_DINNER: 'Dinner',
  MEAL_SHABBOS_FRIDAY_NIGHT: 'Friday Night Meal',
  MEAL_SHABBOS_DAY: 'Shabbos Day Meal',
  MEAL_SEUDAH_SHLISHIS: 'Seudah Shlishis',
  BABYSITTING: 'Babysitting',
  HOSPITAL_VISIT: 'Hospital Visit',
  RIDES: 'Rides',
  GROCERY_RUN: 'Grocery Run',
  ERRANDS: 'Errands',
  LAUNDRY: 'Laundry',
  HOUSEHOLD_HELP: 'Household Help',
  DOG_WALKING: 'Dog Walking',
  CHILDCARE_PICKUP: 'Childcare Pickup',
  OTHER_TASK: 'Other',
};

export const MEAL_COMPONENT_LABELS: Record<MealComponent, string> = {
  FULL_MEAL: 'Full Meal',
  PROTEIN_MAIN: 'Protein/Main Dish',
  SIDES: 'Sides',
  SALAD: 'Salad',
  SOUP: 'Soup',
  DESSERT: 'Dessert',
  DRINKS: 'Drinks',
  BREAD_CHALLAH: 'Challah/Bread',
  APPETIZER: 'Appetizer',
  KUGEL: 'Kugel',
  OTHER: 'Other',
};

export const MEAL_CATEGORY_LABELS: Record<MealCategory, string> = {
  MILCHIG: 'Milchig (Dairy)',
  FLEISHIG: 'Fleishig (Meat)',
  PAREVE: 'Pareve',
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  NOT_STARTED: 'Not Started',
  PREPARING: 'Preparing',
  LEAVING_NOW: 'Leaving Now',
  EN_ROUTE: 'On the Way',
  ARRIVING_SOON: 'Arriving Soon',
  DELIVERED: 'Delivered',
};

export const SIMCHA_CATEGORY_LABELS: Record<SimchaItemCategory, string> = {
  APPETIZER: 'Appetizer',
  MAIN_DISH: 'Main Dish',
  SIDE_DISH: 'Side Dish',
  SALAD: 'Salad',
  SOUP: 'Soup',
  KUGEL: 'Kugel',
  CHALLAH_BREAD: 'Challah/Bread',
  DESSERT: 'Dessert',
  DRINKS: 'Drinks',
  SNACKS: 'Snacks',
  PAPER_GOODS: 'Paper Goods',
  OTHER: 'Other',
};

// Helper to check if task type is a meal
export const isMealTask = (taskType: TaskType): boolean => {
  return taskType.startsWith('MEAL_');
};

// Helper to check if task type is Shabbos-related
export const isShabbosTask = (taskType: TaskType): boolean => {
  return taskType.includes('SHABBOS') || taskType === 'MEAL_SEUDAH_SHLISHIS';
};

// Legacy compatibility - keeping old types for backward support
export type MealDate = TaskSlot;
export type Participant = Contribution;
