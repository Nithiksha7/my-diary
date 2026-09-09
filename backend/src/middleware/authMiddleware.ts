import type { Request, Response, NextFunction } from 'express';
import { verifyToken, JWT_COOKIE_NAME } from '../utils/tokens.js';
import { User, type IUser } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Check HttpOnly cookie first
    let token = req.cookies?.[JWT_COOKIE_NAME];

    // 2. Fallback to Authorization Bearer header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please log in again.',
      });
      return;
    }

    // 3. Verify user exists in database
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication verification failed.',
    });
  }
}
