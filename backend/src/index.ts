import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import passport from 'passport';

import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { configurePassport } from './config/passport.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import trainRoutes from './routes/trains.js';
import participantRoutes from './routes/participants.js';
import donationRoutes from './routes/donations.js';
import giftCardRoutes from './routes/giftCards.js';
import uploadRoutes from './routes/uploads.js';
import webhookRoutes from './routes/webhooks.js';
import contributionRoutes from './routes/contributions.js';
import guestSessionRoutes from './routes/guestSessions.js';
import notificationRoutes from './routes/notifications.js';
import { startScheduler } from './services/scheduler.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(requestLogger);

  configurePassport();
  app.use(passport.initialize());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/trains', trainRoutes);
  app.use('/api/chesed-trains', trainRoutes);
  app.use('/api/participants', participantRoutes);
  app.use('/api/contributions', contributionRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/gift-cards', giftCardRoutes);
  app.use('/api/guest-sessions', guestSessionRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/webhooks', webhookRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler);

  return app;
};

const app = createApp();

export const startServer = () =>
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`);
    startScheduler();
  });

if (require.main === module) {
  startServer();
}

export default app;
