declare module '@prisma/client' {
  export class PrismaClient {
    constructor(options?: unknown);
    [key: string]: any;
  }

  export type User = {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
    phone?: string | null;
    timezone?: string | null;
    emailVerified?: boolean;
    createdAt?: Date;
  };

  export enum DeliveryStatus {
    NOT_STARTED = 'NOT_STARTED',
    PREPARING = 'PREPARING',
    LEAVING_NOW = 'LEAVING_NOW',
    EN_ROUTE = 'EN_ROUTE',
    ARRIVING_SOON = 'ARRIVING_SOON',
    DELIVERED = 'DELIVERED',
  }

  export enum ContributionStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW',
  }

  export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
  }

  export enum DateStatus {
    AVAILABLE = 'AVAILABLE',
    PARTIALLY_FILLED = 'PARTIALLY_FILLED',
    FILLED = 'FILLED',
    CLOSED = 'CLOSED',
    CANCELLED = 'CANCELLED',
  }

  export enum ParticipantStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW',
  }

  export enum TrainStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
  }

  export enum TrainType {
    STANDARD = 'STANDARD',
    FULL_CHESED = 'FULL_CHESED',
    SIMCHA = 'SIMCHA',
    EVENT = 'EVENT',
  }

  export enum TrainCategory {
    NEW_BABY = 'NEW_BABY',
    ILLNESS = 'ILLNESS',
    SURGERY = 'SURGERY',
    LOSS = 'LOSS',
    INJURY = 'INJURY',
    SHIVA = 'SHIVA',
    SIMCHA = 'SIMCHA',
    KIDDUSH = 'KIDDUSH',
    COMMUNITY_EVENT = 'COMMUNITY_EVENT',
    OTHER = 'OTHER',
  }

  export enum SlotStatus {
    AVAILABLE = 'AVAILABLE',
    PARTIALLY_FILLED = 'PARTIALLY_FILLED',
    FILLED = 'FILLED',
    CLOSED = 'CLOSED',
    CANCELLED = 'CANCELLED',
  }

  export enum TaskType {
    MEAL_BREAKFAST = 'MEAL_BREAKFAST',
    MEAL_LUNCH = 'MEAL_LUNCH',
    MEAL_DINNER = 'MEAL_DINNER',
    MEAL_SHABBOS_FRIDAY_NIGHT = 'MEAL_SHABBOS_FRIDAY_NIGHT',
    MEAL_SHABBOS_DAY = 'MEAL_SHABBOS_DAY',
    MEAL_SEUDAH_SHLISHIS = 'MEAL_SEUDAH_SHLISHIS',
    BABYSITTING = 'BABYSITTING',
    HOSPITAL_VISIT = 'HOSPITAL_VISIT',
    RIDES = 'RIDES',
    GROCERY_RUN = 'GROCERY_RUN',
    ERRANDS = 'ERRANDS',
    LAUNDRY = 'LAUNDRY',
    HOUSEHOLD_HELP = 'HOUSEHOLD_HELP',
    DOG_WALKING = 'DOG_WALKING',
    CHILDCARE_PICKUP = 'CHILDCARE_PICKUP',
    OTHER_TASK = 'OTHER_TASK',
  }

  export enum SimchaItemCategory {
    APPETIZER = 'APPETIZER',
    MAIN_DISH = 'MAIN_DISH',
    SIDE_DISH = 'SIDE_DISH',
    SALAD = 'SALAD',
    SOUP = 'SOUP',
    KUGEL = 'KUGEL',
    CHALLAH_BREAD = 'CHALLAH_BREAD',
    DESSERT = 'DESSERT',
    DRINKS = 'DRINKS',
    SNACKS = 'SNACKS',
    PAPER_GOODS = 'PAPER_GOODS',
    OTHER = 'OTHER',
  }

  export enum MealCategory {
    MILCHIG = 'MILCHIG',
    FLEISHIG = 'FLEISHIG',
    PAREVE = 'PAREVE',
  }
}
