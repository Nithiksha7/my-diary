import jwt from 'jsonwebtoken';
import type { Response } from 'express';

const JWT_COOKIE_NAME = 'mydiary_session';
const JWT_EXPIRES_IN = '30d';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'dev_secret_key_my_diary_super_secure_fallback_2026';
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_key_my_diary_super_secure_fallback_2026';
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie(JWT_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
}

export { JWT_COOKIE_NAME };
