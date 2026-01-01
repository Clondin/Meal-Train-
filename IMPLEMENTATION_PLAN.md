# Chesed Train - Feature Enhancement Implementation Plan

## Executive Summary

This document outlines the implementation plan for transforming Chesed Train from a meal-focused platform into a comprehensive chesed coordination system. The enhancements include multi-meal architecture, kosher metadata tracking, non-meal chesed signups, guest access, and simcha/event contribution modes.

---

## Phase 1: Foundation & Data Model Updates (Priority: CRITICAL)

### 1.1 Enhanced Meal/Task Slot Architecture

**Current State:**
- `MealDate` model supports single meal type per date (breakfast/lunch/dinner)
- One participant per slot or `POTLUCK` mode for multiple

**Target State:**
- Multiple meal slots per day
- Split-meal support (protein, sides, dessert contributors)
- Shabbos-specific blocks (Friday night, Shabbos day, Seudah Shlishis)

**Schema Changes:**

```prisma
// NEW: Task type enumeration (replaces simple meal types)
enum TaskType {
  // Meal types
  MEAL_BREAKFAST
  MEAL_LUNCH
  MEAL_DINNER
  MEAL_SHABBOS_FRIDAY_NIGHT
  MEAL_SHABBOS_DAY
  MEAL_SEUDAH_SHLISHIS
  
  // Non-meal chesed
  BABYSITTING
  HOSPITAL_VISIT
  RIDES
  GROCERY_RUN
  ERRANDS
  LAUNDRY
  HOUSEHOLD_HELP
  OTHER
}

// NEW: For split-meal contributions
enum MealComponent {
  FULL_MEAL
  PROTEIN
  SIDES
  DESSERT
  SALAD
  SOUP
  DRINKS
  BREAD_CHALLAH
  OTHER
}

// NEW: Kosher certification levels
enum KashrusLevel {
  STANDARD_KOSHER
  CHOLOV_YISROEL
  PAS_YISROEL
  YOSHON
  GLATT
  MEHADRIN
}

// REPLACE MealDate with more flexible TaskSlot
model TaskSlot {
  id              String          @id @default(uuid())
  trainId         String
  train           ChesedTrain     @relation(fields: [trainId], references: [id], onDelete: Cascade)
  
  date            DateTime        @db.Date
  startTime       String?         // Optional time window
  endTime         String?
  
  taskType        TaskType        @default(MEAL_DINNER)
  allowSplit      Boolean         @default(false)  // Allow multiple contributors
  maxContributors Int             @default(1)
  
  // For non-meal tasks
  taskDescription String?
  estimatedDuration Int?          // Minutes
  location        String?         // For rides, hospital visits
  
  notes           String?
  status          SlotStatus      @default(AVAILABLE)
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  contributions   Contribution[]
  
  @@unique([trainId, date, taskType])
  @@index([trainId, date])
  @@map("task_slots")
}

enum SlotStatus {
  AVAILABLE
  PARTIALLY_FILLED
  FILLED
  CLOSED
  CANCELLED
}

// NEW: Contribution replaces Participant assignment
model Contribution {
  id              String            @id @default(uuid())
  slotId          String
  slot            TaskSlot          @relation(fields: [slotId], references: [id], onDelete: Cascade)
  trainId         String
  train           ChesedTrain       @relation(fields: [trainId], references: [id], onDelete: Cascade)
  
  // Contributor (user or guest)
  userId          String?
  user            User?             @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  // Guest info
  guestName       String?
  guestEmail      String?
  guestPhone      String?
  guestVerified   Boolean           @default(false)
  verificationCode String?
  
  // Meal-specific details
  mealComponent   MealComponent     @default(FULL_MEAL)
  mealCategory    MealCategory?     // Milchig/Fleishig/Pareve
  kashrusLevels   KashrusLevel[]    // Multiple certifications
  allergyInfo     String?
  
  // Day-of confirmation
  confirmedMealCategory Boolean     @default(false)
  confirmedAt     DateTime?
  
  // Delivery tracking
  deliveryStatus  DeliveryStatus?
  deliveryStatusUpdatedAt DateTime?
  estimatedArrival DateTime?
  
  // Description
  itemDescription String?
  notes           String?
  
  status          ContributionStatus @default(CONFIRMED)
  reminderSent    Boolean           @default(false)
  reminderSentAt  DateTime?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@index([slotId])
  @@index([trainId])
  @@map("contributions")
}

enum MealCategory {
  MILCHIG
  FLEISHIG
  PAREVE
}

enum DeliveryStatus {
  NOT_STARTED
  PREPARING
  LEAVING_NOW
  EN_ROUTE
  ARRIVING_SOON
  DELIVERED
}

enum ContributionStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}
```

---

### 1.2 Kosher & Dietary Metadata Enhancement

**New Fields on ChesedTrain (recipient preferences):**

```prisma
model ChesedTrain {
  // ... existing fields ...
  
  // NEW: Enhanced dietary preferences
  requireMilchigFleishig Boolean     @default(true)  // Require category selection
  acceptsMilchig         Boolean     @default(true)
  acceptsFleishig        Boolean     @default(true)
  acceptsPareve          Boolean     @default(true)
  
  // Kashrus requirements
  requireCholovYisroel   Boolean     @default(false)
  requirePasYisroel      Boolean     @default(false)
  requireYoshon          Boolean     @default(false)
  requireGlatt           Boolean     @default(true)
  
  // Allergies (structured)
  allergyNuts            Boolean     @default(false)
  allergyDairy           Boolean     @default(false)
  allergyGluten          Boolean     @default(false)
  allergyEggs            Boolean     @default(false)
  allergyFish            Boolean     @default(false)
  allergyShellfish       Boolean     @default(false)
  allergyOther           String?
  
  // ... rest of model ...
}
```

---

### 1.3 Train Mode Types

**Enhanced TrainType enum:**

```prisma
enum TrainType {
  STANDARD        // Regular chesed train (meals only)
  FULL_CHESED     // Meals + non-meal tasks
  SIMCHA          // Simcha/Kiddush contribution mode
  EVENT           // One-time event coordination
}
```

---

## Phase 2: Guest Access & Low-Friction Signup

### 2.1 Guest Signup Flow

**New Model:**

```prisma
model GuestSession {
  id              String    @id @default(uuid())
  identifier      String    // Phone or email
  identifierType  String    // 'phone' or 'email'
  verificationCode String?
  verified        Boolean   @default(false)
  expiresAt       DateTime
  createdAt       DateTime  @default(now())
  
  @@unique([identifier, identifierType])
  @@map("guest_sessions")
}
```

**Implementation:**
1. Guest enters phone/email only
2. Optional verification code sent
3. Limited permissions (view, signup - no edit)
4. Admin handles changes for guests

---

## Phase 3: Delivery Tracking & Notifications

### 3.1 Lightweight Delivery Status System

**Status Flow:**
```
NOT_STARTED → PREPARING → LEAVING_NOW → EN_ROUTE → ARRIVING_SOON → DELIVERED
```

**Notification Events:**
- Status changes trigger push/SMS to recipient
- Automatic reminder on day of delivery for milchig/fleishig confirmation
- Arrival window estimates (no GPS required)

**New Notification Types:**

```prisma
enum NotificationType {
  // ... existing ...
  DELIVERY_STATUS_UPDATE
  MILCHIG_FLEISHIG_CONFIRMATION_REQUEST
  CONTRIBUTION_REMINDER
  DAY_OF_CONFIRMATION
}
```

---

## Phase 4: Simcha & Event Mode

### 4.1 Simcha Contribution Model

**Key Differences from Regular Train:**
- No fixed "meal owner" - unlimited contributors
- Focus on "what are you bringing" visibility
- Live list prevents duplication
- Categories: Kiddushim, Shabbos meals, Community events

**New Model:**

```prisma
model SimchaContribution {
  id              String    @id @default(uuid())
  trainId         String    // Uses ChesedTrain with type=SIMCHA
  train           ChesedTrain @relation(fields: [trainId], references: [id])
  
  // Contributor
  userId          String?
  user            User?     @relation(fields: [userId], references: [id])
  guestName       String?
  guestPhone      String?
  
  // What they're bringing
  itemCategory    String    // Appetizer, Main, Side, Dessert, Drinks, etc.
  itemDescription String
  servings        Int?      // Approximate number of servings
  
  // Dietary info
  mealCategory    MealCategory
  kashrusLevel    KashrusLevel?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([trainId])
  @@map("simcha_contributions")
}
```

---

## Phase 5: UI/UX Implementation

### 5.1 Frontend Components Needed

1. **TaskSlotCalendar** - Unified calendar showing meals + tasks
2. **SplitMealSignup** - Component selector for meal components
3. **KosherMetadataForm** - Milchig/Fleishig selection with kashrus checkboxes
4. **DeliveryStatusTracker** - Simple status update buttons
5. **GuestSignupModal** - Phone/email only signup
6. **SimchaBoard** - Live contribution list for events
7. **DayOfConfirmation** - Reminder response modal

### 5.2 New Pages

1. `/train/[slug]/tasks` - Non-meal task view
2. `/train/[slug]/simcha` - Simcha contribution board
3. `/train/[slug]/delivery` - Delivery status management
4. `/guest-signup` - Low-friction guest signup flow

---

## Phase 6: Mobile App Architecture

### 6.1 Technology Stack Recommendation

- **Framework:** React Native with Expo
- **State Management:** Zustand (matching web)
- **Notifications:** Firebase Cloud Messaging + SMS fallback
- **Filter Compliance:** Self-contained app, no external browser links for critical flows

### 6.2 Filter-Friendly Design Principles

1. All critical flows in-app (no webview for signups)
2. SMS notifications as primary channel
3. Minimal external API dependencies
4. Approval-friendly content (no ads, no user-generated media)

---

## Implementation Priority Order

| Priority | Phase | Feature | Estimated Effort |
|----------|-------|---------|------------------|
| 1 | 1.1 | Multi-slot/Split-meal architecture | 3-4 days |
| 2 | 1.2 | Kosher metadata system | 2 days |
| 3 | 2.1 | Guest signup flow | 2 days |
| 4 | 3.1 | Delivery status tracking | 2 days |
| 5 | 1.3 | Non-meal chesed tasks | 2 days |
| 6 | 4.1 | Simcha/Event mode | 3 days |
| 7 | 5 | Frontend components | 5-7 days |
| 8 | 6 | Mobile app MVP | 2-3 weeks |

---

## Next Steps

1. **Review and approve this plan**
2. **Begin Phase 1:** Update Prisma schema with new models
3. **Migrate existing data** if needed (MealDate → TaskSlot)
4. **Build API endpoints** for new features
5. **Implement frontend components** progressively

---

## Questions for Stakeholder

1. Should we maintain backward compatibility with existing meal trains or migrate all to new structure?
2. Priority order confirmation - is guest signup more urgent than delivery tracking?
3. Mobile app timeline - build in parallel or after web features complete?
4. SMS provider preference for notifications (Twilio, MessageBird, etc.)?
5. Should Simcha mode be a separate product or integrated feature?

---

*Document created: January 1, 2026*
*Status: Pending Review*
