import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { getJwtSecret } from './env.js';

export interface GuestSessionTokenPayload {
  sessionId: string;
  identifier: string;
  identifierType: 'email' | 'phone';
  purpose: 'guest-session';
}

const GUEST_SESSION_HEADER = 'x-guest-session-token';

export const generateGuestSessionToken = (payload: Omit<GuestSessionTokenPayload, 'purpose'>) =>
  jwt.sign(
    {
      ...payload,
      purpose: 'guest-session',
    },
    getJwtSecret(),
    { expiresIn: '30d' }
  );

export const verifyGuestSessionToken = (token: string): GuestSessionTokenPayload => {
  const payload = jwt.verify(token, getJwtSecret()) as GuestSessionTokenPayload;
  if (payload.purpose !== 'guest-session') {
    throw new AppError('Invalid guest session token', 401);
  }

  return payload;
};

export const getGuestSessionTokenFromRequest = (req: Request): string | null => {
  const headerValue = req.headers[GUEST_SESSION_HEADER];

  if (typeof headerValue === 'string' && headerValue.length > 0) {
    return headerValue;
  }

  if (typeof req.body?.guestSessionToken === 'string' && req.body.guestSessionToken.length > 0) {
    return req.body.guestSessionToken;
  }

  return null;
};

export async function requireVerifiedGuestSession(
  req: Request,
  expected?: Partial<Pick<GuestSessionTokenPayload, 'identifier' | 'identifierType'>>
) {
  const token = getGuestSessionTokenFromRequest(req);
  if (!token) {
    throw new AppError('Verified guest session required', 401);
  }

  const payload = verifyGuestSessionToken(token);
  const session = await prisma.guestSession.findUnique({
    where: { id: payload.sessionId },
  });

  if (!session || !session.verified || session.expiresAt < new Date()) {
    throw new AppError('Guest session is invalid or expired', 401);
  }

  if (expected?.identifier && session.identifier !== expected.identifier) {
    throw new AppError('Guest session does not match the provided identifier', 403);
  }

  if (expected?.identifierType && session.identifierType !== expected.identifierType) {
    throw new AppError('Guest session does not match the provided identifier type', 403);
  }

  return session;
}
