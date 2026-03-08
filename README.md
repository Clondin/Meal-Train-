# MealTrain - Community Meal Coordination Platform

A full-stack web application for organizing meal delivery schedules for those in need. Built with Next.js 14, Express.js, PostgreSQL, and Stripe.

## Features

### Core Functionality
- **Meal Train Creation**: Multi-step wizard to create meal trains with recipient info, schedule, preferences, and settings
- **Interactive Calendar**: Visual calendar showing available dates for volunteer sign-ups
- **Volunteer Sign-ups**: Easy sign-up process for volunteers to claim delivery dates
- **Donations**: Stripe-powered donation system with optional goals
- **Gift Cards**: Purchase and send digital gift cards to recipients
- **Email Notifications**: Automated reminders, confirmations, and updates via SendGrid

### User Features
- **Authentication**: Email/password and OAuth (Google, Facebook) sign-in
- **Dashboard**: Manage organized meal trains, participations, and donations
- **Profile Management**: Update account settings, change password, delete account
- **Search**: Find public meal trains by name, location, or category

### Admin Features
- **Train Management**: Full control over dates, participants, and settings
- **Participant Approval**: Optional approval workflow for volunteer sign-ups
- **Analytics**: View statistics on meals scheduled, donations, and gift cards
- **Reports**: Export participant and donation data

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **UI Components**: Headless UI, Heroicons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport.js (OAuth)
- **Payments**: Stripe
- **Email**: SendGrid
- **File Storage**: AWS S3

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Stripe account
- SendGrid account (optional, for emails)
- AWS S3 bucket (optional, for file uploads)
- Google/Facebook OAuth apps (optional, for social login)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/meal-train.git
   cd meal-train
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Backend (`backend/.env`):
   ```env
   NODE_ENV=development
   PORT=4000
   API_URL=http://localhost:4000
   FRONTEND_URL=http://localhost:3000

   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/mealtrain?schema=public"

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d

   # OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret

   # Stripe
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx

   # SendGrid (optional)
   SENDGRID_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=noreply@yourdomain.com

   # AWS S3 (optional)
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   ```

   Frontend (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   NEXT_PUBLIC_SENTRY_DSN=
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000

### Test Accounts
After seeding, you can log in with:
- Email: `organizer@example.com` / Password: `password123`
- Email: `volunteer@example.com` / Password: `password123`

## Project Structure

```
meal-train/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seeder
│   ├── src/
│   │   ├── config/          # Database & OAuth config
│   │   ├── middleware/      # Auth, error handling
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Email, Stripe, S3
│   │   ├── utils/           # JWT, slug generation
│   │   └── index.ts         # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   │   ├── (auth)/      # Auth pages
│   │   │   ├── create/      # Create wizard
│   │   │   ├── dashboard/   # User dashboard
│   │   │   ├── train/       # Train display
│   │   │   └── search/      # Search page
│   │   ├── components/      # UI components
│   │   ├── lib/             # API client, utils
│   │   ├── stores/          # Zustand stores
│   │   └── types/           # TypeScript types
│   └── package.json
└── package.json             # Root package
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-email` - Verify email
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth

### Meal Trains
- `GET /api/trains` - List public trains
- `POST /api/trains` - Create train
- `GET /api/trains/:slug` - Get train details
- `PATCH /api/trains/:slug` - Update train
- `DELETE /api/trains/:slug` - Delete train
- `GET /api/trains/:slug/task-slots` - List task slots
- `POST /api/trains/:slug/task-slots` - Create task slot
- `GET /api/trains/:slug/contributions` - List contributions
- `POST /api/trains/:slug/contributions` - Create contribution
- `GET /api/trains/:slug/analytics` - Get analytics

### Guest Sessions
- `POST /api/guest-sessions` - Start guest verification
- `POST /api/guest-sessions/verify` - Verify guest session and receive guest token

### User Dashboard
- `GET /api/users/trains` - Get organized trains
- `GET /api/users/dashboard-stats` - Get aggregated dashboard metrics

### Donations
- `POST /api/donations` - Create donation
- `POST /api/donations/checkout` - Create checkout session
- `GET /api/donations/train/:trainId` - Get train donations

### Gift Cards
- `POST /api/gift-cards` - Purchase gift card
- `GET /api/gift-cards/vendors` - List vendors
- `GET /api/gift-cards/train/:trainId` - Get train gift cards

## Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables
3. Deploy

### Backend (AWS/GCP)
1. Set up a PostgreSQL database (e.g., AWS RDS, Supabase)
2. Deploy to AWS EC2/ECS or Google Cloud Run
3. Configure environment variables
4. Set up Stripe webhooks

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Support

For questions or issues, please open a GitHub issue or contact support@mealtrain.com.
