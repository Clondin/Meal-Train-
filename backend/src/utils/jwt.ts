import jwt, { type SignOptions } from 'jsonwebtoken';
import { getJwtSecret } from './env.js';

const JWT_SECRET: jwt.Secret = getJwtSecret();
const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) ?? '7d';
const REFRESH_TOKEN_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn']) ?? '30d';

interface TokenPayload {
  userId: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
