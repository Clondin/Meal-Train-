# App Level-Up Plan

## Context

Chesed Train is a meal coordination platform (like MealTrain) with significant Jewish community-specific features (kosher tracking, Shabbos meals, simcha mode, non-meal chesed tasks). The backend and data model are substantially built (~56 endpoints, 14 models), but the frontend has critical bugs, the create wizard doesn't expose the platform's differentiating features, there's no notification system, and several models/routes are disconnected. This plan takes the app from ~65% to a shippable v1.

---

## Phase 1: Fix Critical Bugs (Tier 1)

### 1.1 Fix Dashboard Train Detail Page
**File:** `frontend/src/app/dashboard/trains/[id]/page.tsx`
- Lines 41-42 call `api.getMealDates(trainId)` and `api.getParticipants(trainId)` which don't exist
- Replace with `api.getTaskSlots(trainId)` and `api.getContributions(trainId)` (both exist in api.ts)
- Update all downstream references from `datesData`/`participantsData` to use TaskSlot/Contribution types

### 1.2 Fix Legacy Type Mismatches (5 files)
Each file references `train.dates`, `train.participants`, or lowercase status strings:

| File | Fix |
|------|-----|
| `frontend/src/app/dashboard/trains/page.tsx` (lines 87-90) | `train.dates` -> `train.taskSlots`, `train.participants` -> `train.contributions`, `'claimed'`/`'delivered'` -> `'FILLED'`/`'DELIVERED'` |
| `frontend/src/app/dashboard/trains/[id]/components/ParticipantManager.tsx` | `participant.name` -> `participant.guestName \|\| participant.user?.firstName`, `d.participantId` -> correct field |
| `frontend/src/app/train/[slug]/components/TrainHero.tsx` (lines 11-26) | `train.dates` -> `train.taskSlots`, status enums to uppercase |
| `frontend/src/app/train/[slug]/components/MealCalendar.tsx` | Uses `MealDate` type and `train.dates` -> refactor to use `TaskSlot` and `train.taskSlots`, fix `mealDate.participant?.name` and `mealDate.mealType` |
| `frontend/src/app/search/page.tsx` | `train._count?.participants` -> `train._count?.contributions` |

### 1.3 Fix Missing TaskTypeSelector Export
**File:** `frontend/src/components/chesed/index.ts`
- Remove the `TaskTypeSelector` export (no such component exists), or create a simple one

### 1.4 Make Header Auth-Aware
**File:** `frontend/src/components/layout/Header.tsx`
- Import `useAuthStore` from `@/stores/auth`
- Conditionally show "Dashboard" link + user avatar when authenticated
- Show "Sign In" / "Get Started" when not authenticated
- Add logout button to user dropdown

### 1.5 Wire Up Guest Session Backend Routes
**File (new):** `backend/src/routes/guestSessions.ts`
- `POST /api/guest-sessions` — create session, generate verification code, set expiry
- `POST /api/guest-sessions/verify` — verify code, mark session verified
- Mount in `backend/src/index.ts`
- The `GuestSession` Prisma model already exists, frontend already calls `api.createGuestSession()` and `api.verifyGuestSession()`

---

## Phase 2: Complete the Core Loop (Tier 2)

### 2.1 Level Up Create Wizard
**Files:** `frontend/src/app/create/page.tsx`, `frontend/src/app/create/components/PreferencesStep.tsx`

The create wizard currently uses free-text fields for dietary preferences/allergies and doesn't expose train type, kosher settings, or structured allergies. The backend and display components already support all of these.

**Add to PreferencesStep.tsx:**
- Meal category acceptance toggles (acceptsMilchig, acceptsFleishig, acceptsPareve)
- Kashrus requirement checkboxes (requireCholovYisroel, requirePasYisroel, requireYoshon, requireGlatt)
- Structured allergy checkboxes (nuts, dairy, gluten, eggs, fish, shellfish) + free-text "other"
- Keep household size, delivery instructions, food likes/dislikes

**Add new step or extend DonationsStep:**
- Train type selector (STANDARD, FULL_CHESED, SIMCHA, EVENT) with descriptions
- For FULL_CHESED: show what non-meal task types will be available
- For SIMCHA: explain contribution board mode

**Fix submission** (`page.tsx` lines 155-168):
- Currently drops `foodLikes`, `foodDislikes`, `donationsEnabled`, `giftCardsEnabled`, `trainType`, `isPublic`, `requireApproval`, `showParticipants`, `enableReminders`, `reminderHours`
- Submit ALL form fields to the API
- Add structured kosher/allergy fields to the submission payload

**Reuse:** The `KosherMetadataForm` component in `frontend/src/components/chesed/KosherMetadataForm.tsx` already handles milchig/fleishig/kashrus UI — adapt it for the organizer-side (train preferences vs contributor preferences)

### 2.2 Build Notification Cron System
**Backend changes:**

**New dependency:** Add `node-cron` to backend
**New file:** `backend/src/services/scheduler.ts`
- Daily job (e.g., 8am): Query TaskSlots where `date = tomorrow` and status != CANCELLED, find confirmed Contributions, call `sendReminderEmail()` for each, update `reminderSent`/`reminderSentAt` on Contribution
- Daily job (e.g., 7am day-of): For contributions on today's date where `confirmedMealCategory = false`, create `DAY_OF_CONFIRMATION_REQUEST` notification + send email
- Weekly job (Monday 9am): For each active train organizer, send digest (slots filled this week, upcoming unfilled slots, donation totals)
- Create Notification records for all sent notifications

**Wire into `backend/src/index.ts`:** Import and start scheduler after server listen

**Existing resources to reuse:**
- `sendReminderEmail()` in `backend/src/services/email.ts` (lines 188-250) — already fully implemented with HTML template
- `Notification` model + `NotificationType` enum in schema — already has `CONTRIBUTION_REMINDER`, `DAY_OF_CONFIRMATION_REQUEST`, `REMINDER` types
- `Contribution.reminderSent` / `reminderSentAt` fields already exist

### 2.3 Build Notification API Routes
**New file:** `backend/src/routes/notifications.ts`
- `GET /api/notifications` — get current user's notifications (paginated, filterable by read/unread)
- `PATCH /api/notifications/:id/read` — mark as read
- `POST /api/notifications/read-all` — mark all as read
- `GET /api/notifications/unread-count` — for badge count
- Mount in `backend/src/index.ts`

**Frontend:**
- Add notification methods to `frontend/src/lib/api.ts`
- Add notification bell component to dashboard layout (`frontend/src/app/dashboard/layout.tsx`)
- Simple dropdown showing recent notifications with unread count badge

### 2.4 Clean Up Dead Footer Links
**File:** `frontend/src/components/layout/Footer.tsx`
- Remove links to non-existent pages OR create minimal static pages for critical ones:
  - Keep and create: `/about`, `/privacy`, `/terms` (even if placeholder)
  - Remove: `/pricing`, `/blog`, `/careers`, `/press`, `/partners`, `/cookies`, `/accessibility`, `/guidelines`, `/safety`, `/faq`
  - `/help` and `/contact` can link to a mailto or GitHub issues for now

---

## Phase 3: Level Up Beyond MealTrain (Tier 3)

### 3.1 Thank-You Notes Feature
Recipients should be able to thank contributors.

**Schema addition:**
```prisma
model ThankYouNote {
  id              String   @id @default(uuid())
  trainId         String
  contributionId  String?
  recipientUserId String   // The train recipient writing the note
  message         String
  createdAt       DateTime @default(now())
}
```

**Backend:** New route `POST /api/trains/:slug/thank-you` + `GET`
**Frontend:** "Send Thanks" button on train management page, display notes on contributor's participation page

### 3.2 PWA Setup
**Files:** `frontend/public/manifest.json`, `frontend/src/app/layout.tsx`
- Add web app manifest with icons, theme color, display: standalone
- Add meta tags for iOS/Android
- Register service worker for offline caching of static assets
- This enables "Add to Home Screen" on mobile — a lightweight mobile app without React Native

### 3.3 Consolidate Duplicate Components
5 components exist in both `components/chesed/` and `app/train/[slug]/components/`:
- KosherMetadataForm, SimchaBoard, SplitMealSignup, DeliveryStatusTracker, TaskSlotCalendar

**Strategy:** Keep the `components/chesed/` versions as the canonical ones with flexible props. Refactor the page-level versions to import and wrap the shared components, passing train-specific data as props. Delete duplicated logic.

### 3.4 SMS Notifications (Stretch)
- Add Twilio SDK to backend
- New service: `backend/src/services/sms.ts`
- Send SMS for critical notifications (day-of reminder, delivery status) when user has phone number
- Especially important for guest users who may not check email

---

## Phase 4: Polish & Infrastructure (Tier 4)

### 4.1 Fix Remaining Technical Debt
- **S3 ownership check:** Add file ownership tracking to uploads route
- **AWS SDK v2 -> v3:** Migrate `backend/src/services/s3.ts` from `aws-sdk` to `@aws-sdk/client-s3`
- **Remove unused `swr` dependency** from frontend package.json
- **Fix auth pages** (forgot-password, reset-password, verify-email) to use the API client instead of raw axios

### 4.2 Seed File Update
**File:** `backend/prisma/seed.ts`
- Add TaskSlot, Contribution, SimchaContribution, GiftCard, and Notification seed data
- Currently only seeds legacy MealDate/Participant models

### 4.3 Basic Test Suite
- Backend: Auth flow (register/login/refresh), Train CRUD, Contribution flow, Payment webhook handling
- Frontend: Key page renders, create wizard submission, auth store behavior
- Use Jest (already a devDependency) + supertest for API tests

---

## Implementation Order

| Step | What | Est. Scope | Dependencies |
|------|------|-----------|--------------|
| 1.1 | Fix dashboard train detail | Small | None |
| 1.2 | Fix legacy type mismatches (5 files) | Medium | None |
| 1.3 | Fix TaskTypeSelector export | Tiny | None |
| 1.4 | Auth-aware header | Small | None |
| 1.5 | Guest session backend routes | Small | None |
| 2.1 | Level up create wizard | Large | None |
| 2.2 | Notification cron system | Medium | None |
| 2.3 | Notification API + frontend bell | Medium | 2.2 |
| 2.4 | Clean up footer links | Small | None |
| 3.1 | Thank-you notes | Medium | None |
| 3.2 | PWA setup | Small | None |
| 3.3 | Consolidate duplicate components | Medium | 1.2 |
| 3.4 | SMS notifications | Medium | 2.2 |
| 4.1 | Technical debt fixes | Small | None |
| 4.2 | Seed file update | Small | None |
| 4.3 | Basic test suite | Large | All above |

---

## Verification

After each phase:
1. `npm run dev` — both frontend (localhost:3000) and backend (localhost:4000) start without errors
2. `npx prisma migrate dev` — any schema changes migrate cleanly
3. Manual test: create a train via wizard -> verify all new fields save -> sign up as volunteer -> verify calendar/contributions work -> test delivery status flow
4. Verify notification cron fires (can use short interval for testing)
5. Check all dashboard pages load without console errors
6. Test guest signup flow end-to-end
