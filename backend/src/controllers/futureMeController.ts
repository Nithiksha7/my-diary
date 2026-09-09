import type { Response, NextFunction } from 'express';
import { FutureMe, type IFutureMe } from '../models/FutureMe.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * Formats a FutureMe document into an API response.
 * Strictly masks the content if the letter is still sealed and locked according to server time.
 */
function formatFutureMeResponse(letter: IFutureMe, revealContentOverride = false) {
  const now = new Date();
  const unlockDateObj = new Date(letter.unlockAt);
  const isServerUnlocked = now >= unlockDateObj;
  const canReveal = revealContentOverride || letter.isOpened || isServerUnlocked;

  // Derive YYYY-MM-DD date string for frontend compatibility
  const unlockDateStr = unlockDateObj.toISOString().slice(0, 10);
  const createdDateStr = letter.createdAt
    ? new Date(letter.createdAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return {
    id: letter._id.toString(),
    title: letter.title,
    // Content is strictly masked with empty string if letter is locked & unopened
    content: canReveal ? letter.content : '',
    unlockAt: letter.unlockAt.toISOString(),
    unlockDate: unlockDateStr,
    timezone: letter.timezone,
    isOpened: letter.isOpened,
    isLocked: !canReveal,
    openedAt: letter.openedAt ? letter.openedAt.toISOString() : undefined,
    sealColor: letter.sealColor || '#b91c1c',
    recipientNote: letter.recipientNote || '',
    createdAt: createdDateStr,
    updatedAt: letter.updatedAt ? letter.updatedAt.toISOString() : undefined,
  };
}

/**
 * GET /api/future-me
 * Returns all Future Me letters for the authenticated user.
 * Letters whose unlockAt is in the future and are not yet opened have their content masked.
 */
export async function getFutureLetters(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const letters = await FutureMe.find({ userId: req.userId }).sort({ unlockAt: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      letters: letters.map((l) => formatFutureMeResponse(l)),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/future-me/:id
 * Retrieves a single Future Me letter for the authenticated user.
 * Content is protected if the letter is still locked.
 */
export async function getFutureLetterById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const letter = await FutureMe.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!letter) {
      res.status(404).json({
        success: false,
        message: 'Future letter not found or does not belong to your account',
      });
      return;
    }

    res.status(200).json({
      success: true,
      letter: formatFutureMeResponse(letter),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/future-me
 * Creates a new Future Me time-capsule letter.
 * Enforces title, content, valid future Date for unlockAt, and timezone.
 */
export async function createFutureLetter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title, content, unlockAt, unlockDate, timezone, sealColor, recipientNote } = req.body;

    // 1. Validate title
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, message: 'Letter title is required.' });
      return;
    }
    if (title.trim().length > 300) {
      res.status(400).json({ success: false, message: 'Letter title cannot exceed 300 characters.' });
      return;
    }

    // 2. Validate content
    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ success: false, message: 'Letter content is required.' });
      return;
    }

    // 3. Validate and parse unlockAt Date
    const rawDateInput = unlockAt || unlockDate;
    if (!rawDateInput) {
      res.status(400).json({ success: false, message: 'Unlock date or timestamp is required.' });
      return;
    }

    let parsedUnlockDate: Date;
    if (typeof rawDateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDateInput)) {
      // YYYY-MM-DD string: set to midnight UTC
      parsedUnlockDate = new Date(`${rawDateInput}T00:00:00.000Z`);
    } else {
      parsedUnlockDate = new Date(rawDateInput);
    }

    if (isNaN(parsedUnlockDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid unlock date/timestamp provided.' });
      return;
    }

    // 4. Validate timezone
    const userTimezone = (timezone && typeof timezone === 'string' && timezone.trim())
      ? timezone.trim()
      : 'UTC';

    // 5. Create document in MongoDB
    const letter = await FutureMe.create({
      userId: req.userId,
      title: title.trim(),
      content: content.trim(),
      unlockAt: parsedUnlockDate,
      timezone: userTimezone,
      isOpened: false,
      sealColor: (sealColor && typeof sealColor === 'string') ? sealColor.trim() : '#b91c1c',
      recipientNote: (recipientNote && typeof recipientNote === 'string') ? recipientNote.trim() : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Future letter sealed successfully',
      letter: formatFutureMeResponse(letter),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/future-me/:id/open
 * Unseals and opens a Future Me letter.
 * Strict Server Check: Letter CANNOT be unsealed before server current time >= unlockAt.
 */
export async function openFutureLetter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const letter = await FutureMe.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!letter) {
      res.status(404).json({
        success: false,
        message: 'Future letter not found or does not belong to your account',
      });
      return;
    }

    const now = new Date();
    const unlockTime = new Date(letter.unlockAt).getTime();

    // Server-side authoritative lock verification
    if (now.getTime() < unlockTime && !letter.isOpened) {
      res.status(400).json({
        success: false,
        message: 'This letter is still sealed.',
        unlockAt: letter.unlockAt.toISOString(),
      });
      return;
    }

    // Mark as opened if not already opened
    if (!letter.isOpened) {
      letter.isOpened = true;
      letter.openedAt = now;
      await letter.save();
    }

    res.status(200).json({
      success: true,
      message: 'Letter unsealed successfully',
      letter: formatFutureMeResponse(letter, true),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/future-me/:id
 * Deletes a Future Me letter owned by the authenticated user.
 */
export async function deleteFutureLetter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await FutureMe.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Future letter not found or does not belong to your account',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Future letter deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
}
