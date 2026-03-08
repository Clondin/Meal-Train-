# App Level Up — Unified Production Readiness Plan

This document merges the Codex security audit findings with a full production readiness audit into a single actionable plan. Work through the tiers in order.

---

## Completed Scope

- Root workspace quality gates are working: `test`, `lint`, and `build`.
- Backend and frontend task-slot APIs are aligned, including bulk creation and list filtering.
- Guest session request and verification now use the real guest-session API end to end.
- Participant approval now notifies the volunteer by email and in-app notification.
- Notification routes, scheduler jobs, thank-you notes, auth-aware header, dashboard bell, PWA assets, and static support pages are all present.
- Shared form control hook-order bugs were fixed.
- Real tests were added for:
  - backend task-slot bulk creation and filtering
  - frontend create-train flow
  - frontend guest-signup verification flow

## Verification (run after every tier)

```bash
npm run test
npm run lint
npm run build
```

## Notes

- The app still intentionally renders a few pages dynamically because they depend on client-side URL state (`searchParams`). That does not block correctness.

---

## Tier 1 — Security & Auth Fixes (Ship Blockers)

These issues will cause data leaks, auth bypasses, or exploitable vulnerabilities in production. Fix all of these before any deployment.

### 1.1 Private train data is exposed (CRITICAL)

**File:** `backend/src/routes/trains.ts` — public train fetch route

**Problem:** The route returns full train data (participants, scheduling, recipient contact info) without checking `train.isPublic`. Anyone with a slug can fetch private train details.

**Fix:**
- Check `train.isPublic` for unauthenticated and non-organizer/non-admin users before returning data.
- Audit the response shape — strip private recipient fields (phone, address, contact preferences) for unauthorized viewers.
- Add a test: anonymous GET on a private train slug returns 403.

### 1.2 Anonymous users can mutate task slots (CRITICAL)

**File:** `backend/src/routes/trains.ts:576-578`

**Problem:** Authorization check resolves to `true` when `req.user` is undefined:
```typescript
const isAuthorized = req.user ? isOrganizerOrAdmin(train, req.user.id) : true;
```

**Fix:**
- Require organizer/admin auth for task-slot creation and updates (POST/PATCH on `/:slug/task-slots`).
- Contributing to an existing slot (POST on `/:slug/contributions`) can remain open for public trains.
- Add a regression test proving anonymous users cannot create or overwrite slots.

### 1.3 Remove JWT fallback secret (CRITICAL)

**File:** `backend/src/utils/jwt.ts:3`

**Problem:** Hardcoded `'fallback-secret-change-in-production'` means all tokens are signed with a known secret if the env var is missing.

**Fix:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
```

### 1.4 Upgrade Next.js — patch critical CVEs

**File:** `frontend/package.json`

**Problem:** Next.js 14.0.4 has 4 DoS vulnerabilities and 1 middleware auth bypass (GHSA-f82v-jwr5-mffw).

**Fix:** `cd frontend && npm install next@14.2.35` (or run `npm audit fix` from root). Verify all pages still render.

### 1.5 Fix OAuth login flow (HIGH)

**Files:**
- `backend/src/routes/auth.ts` — callback redirect
- `frontend/src/app/auth/callback/page.tsx` — callback handler
- `frontend/src/lib/api.ts` — token storage
- `frontend/src/stores/auth.ts` — auth state

**Problem:** Backend redirects with `token` and `refreshToken` params, but frontend callback expects a `user` param and fails without it. Token storage is split between the auth store and the API client.

**Fix:**
- Define one callback contract. Backend should redirect with `token` only; frontend fetches `/auth/me` to hydrate user.
- Unify token persistence — auth store and API client must read/write the same localStorage key.
- Validate parsed URL params with Zod before storing (currently `JSON.parse(userParam)` trusts the URL blindly at `callback/page.tsx:46-54`).
- Manually verify Google and Facebook login end-to-end.

### 1.6 Fix guest identity spoofing (HIGH)

**File:** `backend/src/routes/participants.ts:11-22` (and contribution equivalents)

**Problem:** Guests can update/cancel contributions by providing a matching email or phone in the request body. No verification that the request came from the original guest — anyone who knows a guest's email can hijack their contribution.

**Fix:** Require the guest session verification token to authenticate all guest write operations. The flow:
1. Guest creates session → gets verification code
2. Guest verifies → gets a token
3. All subsequent guest actions include this token
4. Backend validates the token against the GuestSession table

### 1.7 Standardize API base URL handling (HIGH)

**Files:**
- `frontend/.env.example`
- `README.md`
- `frontend/src/lib/api.ts`
- `frontend/src/app/train/[slug]/page.tsx`

**Problem:** Code expects `NEXT_PUBLIC_API_URL` to include `/api`, but README and `.env.example` define it without `/api`. A production deploy using documented values will send requests to wrong paths.

**Fix:**
- Pick one convention (recommend: env var does NOT include `/api`, code appends it).
- Update docs, `.env.example`, `.env.local`, and all fetch call sites to match.
- Validate by following documented setup steps from scratch in a clean environment.

### 1.8 Add startup env validation (MEDIUM)

**File:** `backend/src/index.ts` (add near top, before any route registration)

**Problem:** App silently runs with missing API keys. SendGrid, Stripe, S3 all fail at request time instead of at boot.

**Fix:** Add a validation block that checks required env vars and exits with a clear error if any are missing:

**Required (crash if missing in production):**
- `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY` (must start with `SG.`)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`
- `FRONTEND_URL`

**Optional (log warning if missing):**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`

### 1.9 Run npm audit fix

**Problem:** 32 vulnerabilities total (2 critical, 26 high, 2 moderate, 2 low). Key items:
- `next@14.0.4` — critical DoS + auth bypass
- `fast-xml-parser` via `aws-sdk` — critical DoS
- `axios` — high DoS via `__proto__`

**Fix:**
```bash
npm audit fix          # non-breaking fixes
npm audit fix --force  # if needed for Next.js
```

Review breaking changes if `--force` is needed. Also plan aws-sdk v2 → v3 migration (see Tier 3).

---

## Tier 2 — Production Quality (Before Launch)

These won't cause immediate security breaches but will cause bugs, poor UX, and operational pain at scale.

### 2.1 Consolidate data models — remove legacy MealDate/Participant

**Problem:** Two parallel architectures coexist:
- **Legacy:** `MealDate` + `Participant`
- **New:** `TaskSlot` + `Contribution` (split meals, kosher metadata, delivery tracking, non-meal tasks)

Both have routes; frontend references both inconsistently, causing type mismatches and broken pages.

**Plan:**
1. Audit every reference to `MealDate` and `Participant` in frontend and backend.
2. Migrate any remaining frontend pages using the old model to `TaskSlot`/`Contribution`.
3. Write a data migration script if there's any production data in the old tables.
4. Remove models from `prisma/schema.prisma`.
5. Delete `backend/src/routes/participants.ts`.
6. Remove legacy endpoints from `backend/src/routes/trains.ts` (`/dates` routes).
7. Remove from `backend/src/index.ts` route registration.
8. Remove legacy methods from `frontend/src/lib/api.ts` and `frontend/src/types/index.ts`.
9. Generate new Prisma migration.

**Files affected:**
- `backend/prisma/schema.prisma`
- `backend/src/routes/participants.ts` (delete)
- `backend/src/routes/trains.ts`
- `backend/src/index.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/types/index.ts`
- `frontend/src/app/dashboard/trains/[id]/` (DateManager component)

### 2.2 Add pagination to all list endpoints

**Problem:** These endpoints return ALL records with no limit:
- `GET /api/trains/:slug/contributions`
- `GET /api/trains/:slug/task-slots`
- `GET /api/trains/:slug/simcha-contributions`
- `GET /api/users/trains`
- `GET /api/users/contributions`
- `GET /api/users/donations`

**Fix:** Accept `?page=1&limit=20` query params. Return:
```json
{ "data": [...], "pagination": { "page": 1, "limit": 20, "total": 142, "pages": 8 } }
```

### 2.3 Fix dashboard data loading

**File:** `frontend/src/app/dashboard/page.tsx:52-70`

**Problem:** Dashboard loops through all user trains making individual API calls for stats — O(N) requests. "Upcoming Deliveries" section (lines 344-378) is a static placeholder with no real data.

**Fix:** Create a backend endpoint `GET /api/users/dashboard-stats` that returns aggregated data in one query:
```json
{
  "totalTrains": 5,
  "activeTrains": 2,
  "totalContributions": 23,
  "totalDonationsAmount": 450.00,
  "upcomingDeliveries": [...]
}
```

Wire the frontend to use it.

### 2.4 Add Dockerfiles and docker-compose

**Files to create:**
- `backend/Dockerfile` — Node 18 alpine, multi-stage (deps + prisma generate → dist), port 4000
- `frontend/Dockerfile` — Node 18 alpine, multi-stage (deps → next build → next start), port 3000
- `docker-compose.yml` (root) — backend, frontend, postgres:15 with healthcheck and volume
- `.dockerignore` (root) — node_modules, .next, dist, .env, .git

### 2.5 Set up GitHub Actions CI

**File to create:** `.github/workflows/ci.yml`

**Steps:**
1. Trigger on push to main and PRs
2. Node 18, install deps
3. `npm run lint`
4. `npx tsc --noEmit` (both workspaces)
5. `npm run build`
6. `npm test`
7. `npm audit --audit-level=high`

### 2.6 Add E2E tests for critical flows

**Setup:** Playwright (`npm install -D @playwright/test`), create `e2e/` directory at root.

**Flows to cover:**
1. Registration → email verification → login
2. Create a meal train (full wizard)
3. View public train → sign up as contributor
4. Guest sign up (no account)
5. Donation via Stripe test mode
6. Dashboard loads with correct stats
7. Update delivery status as contributor
8. Organizer views participants and donations

### 2.7 Set up error tracking (Sentry)

**Files:**
- `backend/src/index.ts` — add `@sentry/node` init
- `frontend/src/app/layout.tsx` — add `@sentry/nextjs`
- `next.config.js` — wrap with `withSentryConfig`

Capture unhandled exceptions, add user context (userId, email), upload source maps.

### 2.8 Add structured logging

**File:** `backend/src/middleware/requestLogger.ts` (replace current console.log implementation)

Replace with Pino or Winston:
- JSON format, log levels (error/warn/info/debug)
- Request ID tracking via `x-request-id` header
- Include: method, url, status, duration, userId

### 2.9 Add session cleanup cron

**File:** `backend/src/services/scheduler.ts`

**Problem:** Sessions table grows forever — expired refresh tokens never pruned.

**Fix:** Daily cron that deletes sessions where `expiresAt < now()`.

### 2.10 Deploy to staging

- Separate database, Stripe test keys, SendGrid sandbox, S3 `-staging` bucket
- Matches production infra (same Docker images)
- Accessible URL for QA testing

---

## Tier 3 — Polish (Post-Launch)

### 3.1 Generate frontend types from Prisma

**Problem:** `frontend/src/types/index.ts` is manually maintained and drifts from schema.

**Options:**
- Shared `packages/types` workspace importing from `@prisma/client`
- OpenAPI spec on backend → `openapi-typescript` for frontend
- Script that runs on build to sync types

### 3.2 Consolidate duplicate components

**Problem:** These exist in both `components/chesed/` AND `app/train/[slug]/components/`:
- `TaskSlotCalendar`, `KosherMetadataForm`, `SimchaBoard`, `DeliveryStatusTracker`, `SplitMealSignup`

**Fix:** Keep canonical in `components/chesed/`, delete duplicates, update imports.

### 3.3 Add Swagger/OpenAPI docs

Document all 56+ endpoints. Serve at `/api/docs` in dev. Export JSON for frontend type generation.

### 3.4 Add per-endpoint rate limiting

- `/api/auth/login` — 5 attempts per 15 min per IP
- `/api/auth/register` — 3 per hour per IP
- `/api/auth/forgot-password` — 3 per hour per email
- `/api/guest-sessions` — 5 per hour per IP

### 3.5 Fix timezone-aware scheduling

**File:** `backend/src/services/scheduler.ts`

**Problem:** Cron runs at fixed UTC times. US West Coast users get reminders at midnight.

**Fix:** Group trains by timezone, send at appropriate local hour. Or run hourly and check each train's local time.

### 3.6 Migrate aws-sdk v2 → v3

**Problem:** `aws-sdk@2.x` is deprecated with known vulnerabilities (fast-xml-parser DoS).

**Fix:** Replace with `@aws-sdk/client-s3`. Breaking change — requires code updates in `backend/src/services/s3.ts`.

### 3.7 Add CSRF protection

Add `csurf` middleware or double-submit cookie pattern. Protects against future changes and the cookie fallback in `middleware/auth.ts`.

### 3.8 Remove console logs from frontend

~10 instances of `console.log`/`console.error` in production code. Remove or wrap in `if (process.env.NODE_ENV === 'development')`.

### 3.9 Fix file upload validation

**File:** `backend/src/routes/uploads.ts`

**Problem:** Only MIME type checked, not magic bytes.

**Fix:** Use `file-type` library to verify actual file content matches claimed MIME.

### 3.10 Add pre-commit hooks

```bash
npm install -D husky lint-staged
npx husky init
```

Configure lint-staged for ESLint + Prettier on `*.ts`/`*.tsx`.

### 3.11 Remove dead service worker reference

**File:** `frontend/src/providers.tsx:14`

Registers `/sw.js` which doesn't exist. Remove or implement actual PWA support.

### 3.12 Add missing `/help` page

**File:** `frontend/src/app/help/page.tsx` (create)

Referenced at `frontend/src/app/create/page.tsx:358`. Either create a help/FAQ page or remove the reference.

### 3.13 Database backup strategy

- Managed Postgres: enable automated daily backups, 7-day retention
- Self-hosted: `pg_dump` cron to S3
- Document and test restore procedure before launch

### 3.14 Clean up lint warnings

- Missing React hook dependencies in several pages
- Raw `<img>` tags → use `next/image`
- Client-rendered pages that could be server-rendered

---

## Verification Checklist (Run After Each Tier)

### Security (after Tier 1)
- [ ] Anonymous user cannot access private train data
- [ ] Anonymous user cannot create or modify task slots
- [ ] Organizer and admin flows still work after auth fixes
- [ ] Google login works end to end
- [ ] Facebook login works end to end
- [ ] Guest signup works end to end
- [ ] Guest cannot spoof another guest's identity
- [ ] Authenticated API calls succeed after email/password and OAuth login
- [ ] Fresh deploy using documented env vars works without manual patching
- [ ] App crashes on startup if required env vars are missing
- [ ] `npm audit` shows no critical or high vulnerabilities

### Functionality (after Tier 2)
- [ ] Stripe donation flow works in test mode
- [ ] Gift card checkout flow works in test mode
- [ ] Email flows send correctly or fail explicitly
- [ ] Dashboard loads stats in one request, shows real upcoming deliveries
- [ ] Pagination works on all list endpoints
- [ ] No references to legacy MealDate/Participant model remain
- [ ] CI pipeline passes on a clean PR
- [ ] Docker containers build and run successfully
- [ ] E2E tests pass for all critical flows

### Quality (after Tier 3)
- [ ] Frontend types auto-generated from backend schema
- [ ] No duplicate components
- [ ] API docs accessible at `/api/docs`
- [ ] Reminders sent at correct local time per timezone
- [ ] No console.log in production frontend bundle
- [ ] Pre-commit hooks catch lint/type errors
- [ ] Database backups verified with test restore

---

## Environment Variables Reference

### Backend — Required
```
DATABASE_URL=postgresql://...
JWT_SECRET=<random 64+ char string>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG....
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=us-east-1
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com
NODE_ENV=production
PORT=4000
```

### Backend — Optional
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api.your-domain.com/api/auth/google/callback
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_CALLBACK_URL=https://api.your-domain.com/api/auth/facebook/callback
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FROM_EMAIL=noreply@your-domain.com
FROM_NAME=Chesed Train
```

### Frontend — Required
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Frontend — Optional
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_FACEBOOK_APP_ID=...
```
