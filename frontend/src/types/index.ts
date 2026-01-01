// User Types
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
  name: string;
  phone?: string;
}

// Chesed Train Types
export interface ChesedTrain {
  id: string;
  slug: string;
  title: string;
  description?: string;
  story?: string;
  coverImage?: string;
  recipientName: string;
  recipientAddress?: string;
  recipientCity?: string;
  recipientState?: string;
  recipientZip?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  startDate: string;
  endDate: string;
  defaultDeliveryTime?: string;
  timezone?: string;
  dietaryPreferences?: string;
  allergies?: string;
  foodLikes?: string;
  foodDislikes?: string;
  deliveryInstructions?: string;
  householdSize: number;
  isPublic: boolean;
  allowDonations: boolean;
  allowGiftCards: boolean;
  donationGoal?: number | string;
  requireApproval: boolean;
  showParticipantList: boolean;
  enableReminders: boolean;
  reminderHours: number;
  trainType: 'STANDARD' | 'POTLUCK' | 'PRO';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  category: 'NEW_BABY' | 'ILLNESS' | 'SURGERY' | 'LOSS' | 'INJURY' | 'OTHER';
  organizerId: string;
  organizer?: User;
  dates?: MealDate[];
  participants?: Participant[];
  donations?: Donation[];
  giftCards?: GiftCard[];
  _count?: {
    participants?: number;
    donations?: number;
    dates?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateChesedTrainData {
  recipientName: string;
  recipientAddress: string;
  recipientPhone?: string;
  recipientEmail?: string;
  startDate: string;
  endDate: string;
  description: string;
  dietaryPreferences?: string;
  allergies?: string;
  householdSize?: number;
  defaultDeliveryTime?: string;
  deliveryInstructions?: string;
}

export interface UpdateChesedTrainData extends Partial<CreateChesedTrainData> {
  title?: string;
  description?: string;
  story?: string;
  recipientCity?: string;
  recipientState?: string;
  recipientZip?: string;
  dietaryPreferences?: string;
  allergies?: string;
  foodLikes?: string;
  foodDislikes?: string;
  deliveryInstructions?: string;
  defaultDeliveryTime?: string;
  isPublic?: boolean;
  allowDonations?: boolean;
  allowGiftCards?: boolean;
  donationGoal?: number | null;
  requireApproval?: boolean;
  showParticipantList?: boolean;
  enableReminders?: boolean;
  reminderHours?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
}

// Meal Date Types
export interface MealDate {
  id: string;
  mealTrainId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  participantId?: string;
  participant?: Participant;
  notes?: string;
  status: 'available' | 'claimed' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealDateData {
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  notes?: string;
}

export interface ClaimMealDateData {
  notes?: string;
}

// Participant Types
export interface Participant {
  id: string;
  mealTrainId: string;
  userId?: string;
  user?: User;
  name: string;
  email: string;
  phone?: string;
  mealDates?: MealDate[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateParticipantData {
  name: string;
  email: string;
  phone?: string;
}

// Donation Types
export interface Donation {
  id: string;
  mealTrainId: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  message?: string;
  paymentIntentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationData {
  donorName: string;
  donorEmail?: string;
  amount: number;
  message?: string;
}

// Gift Card Types
export interface GiftCard {
  id: string;
  mealTrainId: string;
  donorName: string;
  donorEmail?: string;
  retailer: string;
  amount: number;
  cardNumber?: string;
  pin?: string;
  message?: string;
  status: 'pending' | 'sent' | 'received';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGiftCardData {
  donorName: string;
  donorEmail?: string;
  retailer: string;
  amount: number;
  cardNumber?: string;
  pin?: string;
  message?: string;
}

// File Upload Types
export interface UploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

// API Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Pagination Types
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
