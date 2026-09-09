import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, type IUser } from '../models/User.js';
import { DiaryEntry } from '../models/DiaryEntry.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/tokens.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

function formatSafeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    settings: user.settings,
    createdAt: user.createdAt,
  };
}

/**
 * POST /api/auth/register
 * Registers a new user with bcrypt-hashed password
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, settings } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Name is required' });
      return;
    }

    if (!email || !email.trim()) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing user
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      });
      return;
    }

    // Hash password with bcrypt (12 rounds)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      settings: settings || {
        activeTheme: 'ocean',
        isLocked: false,
        reducedMotion: false,
      },
    });

    const token = generateToken({ userId: user._id.toString(), email: user.email });
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      user: formatSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Verifies credentials and sets HttpOnly JWT session cookie
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user and explicitly include passwordHash for comparison
    const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const token = generateToken({ userId: user._id.toString(), email: user.email });
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: formatSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile
 */
export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    res.status(200).json({
      success: true,
      user: formatSafeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 * Clears HttpOnly session cookie
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

/**
 * PUT /api/auth/settings
 * Updates user settings and preferences (theme, passcode, etc.)
 */
export async function updateUserSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const updates = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.settings = {
      ...user.settings,
      ...updates,
    };

    await user.save();

    res.status(200).json({
      success: true,
      user: formatSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/migrate-local-data
 * Safely transfers existing client-side localStorage entries to MongoDB
 */
export async function migrateLocalData(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { entries, settings } = req.body;
    let migratedCount = 0;

    if (entries && typeof entries === 'object') {
      const operations = [];

      for (const [dateKey, entryData] of Object.entries(entries as Record<string, any>)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue;

        const content = entryData.content || '';
        const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;

        const userObjectId = new mongoose.Types.ObjectId(req.userId);
        operations.push({
          updateOne: {
            filter: { userId: userObjectId, dateKey },
            update: {
              $set: {
                userId: userObjectId,
                dateKey,
                content,
                oneSentence: entryData.oneSentence || '',
                mood: entryData.mood || undefined,
                littleThings: entryData.littleThings || {},
                currently: entryData.currently || {},
                photos: entryData.photos || [],
                song: entryData.song || undefined,
                isSpecial: Boolean(entryData.isSpecial),
                wordCount,
              },
            },
            upsert: true,
          },
        });
      }

      if (operations.length > 0) {
        const result = await DiaryEntry.bulkWrite(operations);
        migratedCount = (result.upsertedCount || 0) + (result.modifiedCount || 0);
      }
    }

    // Update settings if provided
    if (settings && typeof settings === 'object') {
      await User.findByIdAndUpdate(req.userId, {
        $set: {
          'settings.activeTheme': settings.activeTheme || 'ocean',
          'settings.passcode': settings.passcode,
          'settings.reducedMotion': settings.reducedMotion,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully migrated ${migratedCount} diary entries to MongoDB Atlas`,
      migratedCount,
    });
  } catch (error) {
    next(error);
  }
}
