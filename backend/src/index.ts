import express from 'express';
import { randomUUID } from 'node:crypto';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import passport from 'passport';
import * as Sentry from '@sentry/node';
import swaggerUi from 'swagger-ui-express';

import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { configurePassport } from './config/passport.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import trainRoutes from './routes/trains.js';
import donationRoutes from './routes/donations.js';
import giftCardRoutes from './routes/giftCards.js';
import uploadRoutes from './routes/uploads.js';
import webhookRoutes from './routes/webhooks.js';
import contributionRoutes from './routes/contributions.js';
import guestSessionRoutes from './routes/guestSessions.js';
import notificationRoutes from './routes/notifications.js';
import { startScheduler } from './services/scheduler.js';
import { validateStartupEnv } from './utils/env.js';
import { logger } from './services/logger.js';
import { openApiSpec } from './openapi.js';

dotenv.config();
validateStartupEnv();

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.APP_VERSION,
  });
}

const PORT = process.env.PORT || 4000;
export const createApp = () => {
  const app = express();
  const csrfCookieName = 'csrf-token';
  const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

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

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later.' },
  });
  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many registration attempts, please try again later.' },
  });
  const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => String(req.body?.email || req.ip),
    message: { error: 'Too many password reset attempts, please try again later.' },
  });
  const guestSessionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many guest session attempts, please try again later.' },
  });

  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    const csrfToken = req.cookies?.[csrfCookieName] || randomUUID();

    if (!req.cookies?.[csrfCookieName]) {
      res.cookie(csrfCookieName, csrfToken, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    if (
      unsafeMethods.has(req.method) &&
      req.cookies?.token &&
      req.headers['x-csrf-token'] !== csrfToken
    ) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
  });
  app.use(requestLogger);

  configurePassport();
  app.use(passport.initialize());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  app.get('/api/docs.json', (req, res) => {
    res.json(openApiSpec);
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use('/api/auth/login', loginLimiter);
  app.use('/api/auth/register', registerLimiter);
  app.use('/api/auth/forgot-password', forgotPasswordLimiter);
  app.use('/api/guest-sessions', guestSessionLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/trains', trainRoutes);
  app.use('/api/chesed-trains', trainRoutes);
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
    logger.info({
      port: PORT,
      apiUrl: process.env.API_URL || `http://localhost:${PORT}`,
    }, 'Server started');
    startScheduler();
  });

if (require.main === module) {
  startServer();
}

export default app;
