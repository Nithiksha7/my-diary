import type { Request, Response, NextFunction } from 'express';
import { Letter, type ILetter } from '../models/Letter.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  encryptLetterContent,
  decryptLetterContent,
  generatePublicToken,
  hashToken,
} from '../utils/crypto.js';
import { triggerSchedulerNow } from '../services/schedulerService.js';

/**
 * Calculates the UTC millisecond timestamp from a date, time, and timezone string.
 * Accurately parses offsets (e.g., "+05:30", "GMT+5:30"), IANA names (e.g., "Asia/Kolkata"),
 * and standard abbreviations without adding or double-converting offsets.
 */
function calculateDeliveryTimestamp(dateStr: string, timeStr: string, tzStr?: string): number {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = (timeStr || '00:00').split(':').map(Number);

    const trimmedTz = tzStr?.trim();
    if (trimmedTz === 'UTC' || trimmedTz === 'Universal Time (UTC)') {
      return Date.UTC(year, month - 1, day, hour || 0, minute || 0, 0);
    }

    // 1. If an explicit offset is present in tzStr (e.g. "+05:30", "GMT+5:30", "UTC+05:30", "GMT+0530", "-04:00")
    const offsetMatch = tzStr?.match(/(?:GMT|UTC)?([+-])(\d{1,2})(?::?(\d{2}))?/i);
    if (offsetMatch) {
      const sign = offsetMatch[1] === '-' ? -1 : 1;
      const offsetHours = Number(offsetMatch[2]);
      const offsetMinutes = Number(offsetMatch[3] || 0);
      const totalOffsetMinutes = sign * (offsetHours * 60 + offsetMinutes);
      const utcMs = Date.UTC(year, month - 1, day, hour || 0, minute || 0, 0);
      return utcMs - totalOffsetMinutes * 60 * 1000;
    }

    // 2. If timezone is a named timezone like Asia/Kolkata or India Standard Time
    let iana = trimmedTz;
    if (iana === 'IST' || iana?.includes('India Standard Time')) {
      iana = 'Asia/Kolkata';
    } else if (iana === 'EST' || iana?.includes('Eastern Standard Time')) {
      iana = 'America/New_York';
    } else if (iana === 'PST' || iana?.includes('Pacific Standard Time')) {
      iana = 'America/Los_Angeles';
    } else if (iana === 'CST' || iana?.includes('Central Standard Time')) {
      iana = 'America/Chicago';
    }

    if (iana) {
      try {
        const guessUtc = Date.UTC(year, month - 1, day, hour || 0, minute || 0, 0);
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: iana,
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
        });
        const parts = formatter.formatToParts(new Date(guessUtc));
        const pYear = Number(parts.find((p) => p.type === 'year')?.value);
        const pMonth = Number(parts.find((p) => p.type === 'month')?.value);
        const pDay = Number(parts.find((p) => p.type === 'day')?.value);
        let pHour = Number(parts.find((p) => p.type === 'hour')?.value);
        if (pHour === 24) pHour = 0;
        const pMinute = Number(parts.find((p) => p.type === 'minute')?.value);

        const tzTimeAtGuessUtc = Date.UTC(pYear, pMonth - 1, pDay, pHour, pMinute, 0);
        const offset = tzTimeAtGuessUtc - guessUtc;
        return guessUtc - offset;
      } catch {
        // Fall through
      }
    }

    // Default to server local date
    const localDate = new Date(year, month - 1, day, hour || 0, minute || 0, 0);
    return localDate.getTime();
  } catch {
    return Date.now() + 86400000;
  }
}

/**
 * Formats a letter for the authenticated creator's private dashboard.
 */
function formatLetterResponse(letter: ILetter, rawToken?: string) {
  const token = rawToken || (letter.encryptedToken ? decryptLetterContent(letter.encryptedToken) : '');
  const now = Date.now();
  const isReady =
    now >= letter.scheduledDeliveryTimestamp ||
    letter.status === 'DELIVERED' ||
    letter.status === 'OPENED' ||
    letter.status === 'CONFIG_REQUIRED' ||
    letter.status === 'DELIVERY_FAILED';

  let plainContent: string | null = null;
  if (isReady) {
    plainContent = decryptLetterContent(letter.encryptedContent);
  } else {
    plainContent = '[SEALED & ENCRYPTED ON SERVER]';
  }

  return {
    id: letter._id.toString(),
    type: letter.type,
    recipientName: letter.recipientName,
    recipientEmail: letter.recipientEmail,
    deliveryChannel: letter.deliveryChannel,
    recipientContact: letter.recipientContact,
    title: letter.title,
    content: plainContent,
    scheduledDeliveryDate: letter.scheduledDeliveryDate,
    scheduledDeliveryTime: letter.scheduledDeliveryTime,
    scheduledDeliveryTimestamp: letter.scheduledDeliveryTimestamp,
    timezone: letter.timezone,
    token, // Provided to creator so they can copy/share the link
    status: letter.status,
    sealTheme: letter.sealTheme,
    sealColor: letter.sealColor,
    dispatchedAt: letter.dispatchedAt ? letter.dispatchedAt.toISOString() : undefined,
    deliveredAt: letter.deliveredAt ? letter.deliveredAt.toISOString() : undefined,
    openedAt: letter.openedAt ? letter.openedAt.toISOString() : undefined,
    providerMessageId: letter.providerMessageId,
    deliveryFailureReason: letter.deliveryFailureReason,
    createdAt: letter.createdAt ? letter.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: letter.updatedAt ? letter.updatedAt.toISOString() : undefined,
  };
}

/**
 * Formats a public letter for a recipient accessing via public token.
 * Strictly masks content and encryption details when letter is sealed before delivery moment.
 */
function formatPublicLetterResponse(letter: ILetter, token: string, revealContent = false) {
  const now = Date.now();
  const isReady =
    revealContent ||
    now >= letter.scheduledDeliveryTimestamp ||
    letter.status === 'DELIVERED' ||
    letter.status === 'OPENED';

  let content: string | null = null;
  if (isReady) {
    content = decryptLetterContent(letter.encryptedContent);
  }

  return {
    id: letter._id.toString(),
    token,
    type: letter.type,
    recipientName: letter.recipientName,
    recipientEmail: letter.recipientEmail,
    deliveryChannel: letter.deliveryChannel,
    recipientContact: letter.recipientContact,
    title: letter.title,
    scheduledDeliveryDate: letter.scheduledDeliveryDate,
    scheduledDeliveryTime: letter.scheduledDeliveryTime,
    scheduledDeliveryTimestamp: letter.scheduledDeliveryTimestamp,
    timezone: letter.timezone,
    sealTheme: letter.sealTheme,
    sealColor: letter.sealColor,
    createdAt: letter.createdAt ? letter.createdAt.toISOString() : new Date().toISOString(),
    status: letter.status,
    isDeliverable: isReady,
    content, // strictly null if not ready
  };
}

/**
 * POST /api/letters
 * Creates and seals a new scheduled letter for the authenticated user.
 */
export async function createLetter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      type,
      recipientName,
      recipientEmail,
      deliveryChannel,
      recipientContact,
      title,
      content,
      scheduledDeliveryDate,
      scheduledDeliveryTime,
      timezone,
      sealTheme,
      sealColor,
    } = req.body;

    // 1. Validate title & content
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, message: 'Letter title is required.' });
      return;
    }
    if (title.trim().length > 300) {
      res.status(400).json({ success: false, message: 'Letter title cannot exceed 300 characters.' });
      return;
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ success: false, message: 'Letter message content is required.' });
      return;
    }

    // 2. Validate recipient details & delivery channel
    const { isImmediate } = req.body;
    const letterType = type === 'me' ? 'me' : 'someone';
    const cleanRecipientName = letterType === 'me' ? 'Future Me' : (recipientName?.trim() || 'Recipient');
    const channel = 'link';
    const cleanRecipientContact = recipientContact?.trim() || undefined;

    // 3. Validate schedule date & time
    const nowObj = new Date();
    const todayStr = nowObj.toISOString().split('T')[0];
    const timeStr = `${String(nowObj.getHours()).padStart(2, '0')}:${String(nowObj.getMinutes()).padStart(2, '0')}`;

    const finalDeliveryDate = isImmediate ? (scheduledDeliveryDate || todayStr) : scheduledDeliveryDate;
    const finalDeliveryTime = isImmediate ? (scheduledDeliveryTime || timeStr) : scheduledDeliveryTime;

    if (!finalDeliveryDate || !/^\d{4}-\d{2}-\d{2}$/.test(finalDeliveryDate)) {
      res.status(400).json({ success: false, message: 'Valid scheduled delivery date (YYYY-MM-DD) is required.' });
      return;
    }
    if (!finalDeliveryTime) {
      res.status(400).json({ success: false, message: 'Scheduled delivery time is required.' });
      return;
    }

    const targetTimezone = timezone?.trim() || 'UTC';
    const timestamp = isImmediate
      ? Date.now()
      : (typeof req.body.scheduledDeliveryTimestamp === 'number' && req.body.scheduledDeliveryTimestamp > 0
          ? req.body.scheduledDeliveryTimestamp
          : calculateDeliveryTimestamp(finalDeliveryDate, finalDeliveryTime, targetTimezone));

    // 4. Cryptographic operations:
    // Generate secure random raw token
    const rawToken = generatePublicToken();
    // Compute SHA-256 hash for database indexing & public lookups
    const tokenHash = hashToken(rawToken);
    // Encrypt letter content with AES-256-GCM
    const encryptedContent = encryptLetterContent(content.trim());
    // Encrypt raw token with AES-256-GCM for backend scheduler recovery
    const encryptedToken = encryptLetterContent(rawToken);

    // 5. Store document in MongoDB
    const letter = await Letter.create({
      userId: req.userId,
      type: letterType,
      recipientName: cleanRecipientName,
      deliveryChannel: 'link',
      recipientContact: cleanRecipientContact,
      title: title.trim(),
      encryptedContent,
      encryptedToken,
      scheduledDeliveryDate: finalDeliveryDate,
      scheduledDeliveryTime: finalDeliveryTime,
      scheduledDeliveryTimestamp: timestamp,
      timezone: targetTimezone,
      publicTokenHash: tokenHash,
      status: 'SCHEDULED',
      sealTheme: sealTheme || 'ocean',
      sealColor: sealColor || '#b91c1c',
    });

    console.log(`[LetterController] 🔒 Letter created and sealed: "${letter.title}" (ID: ${letter._id})`);

    // If scheduled delivery timestamp is due or immediate, trigger scheduler
    if (timestamp <= Date.now()) {
      triggerSchedulerNow();
    }

    res.status(201).json({
      success: true,
      message: 'Letter sealed and scheduled successfully',
      letter: formatLetterResponse(letter, rawToken),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/letters/:id/recipient
 * Updates the recipient contact details and optionally name for a letter.
 */
export async function updateLetterRecipient(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { recipientContact, recipientEmail, recipientName } = req.body;

    const letter = await Letter.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!letter) {
      res.status(404).json({
        success: false,
        message: 'Letter not found or does not belong to your account',
      });
      return;
    }

    if (recipientName && typeof recipientName === 'string') {
      letter.recipientName = recipientName.trim();
    }

    const contact = (recipientContact || recipientEmail || '').trim();
    if (contact) {
      letter.recipientContact = contact;
      if (letter.deliveryChannel === 'email' || contact.includes('@')) {
        letter.recipientEmail = contact;
      }
    }

    letter.status = 'SCHEDULED';
    letter.deliveryFailureReason = undefined;
    await letter.save();

    if (letter.scheduledDeliveryTimestamp <= Date.now()) {
      triggerSchedulerNow();
    }

    res.status(200).json({
      success: true,
      message: 'Recipient updated and letter delivery queued',
      letter: formatLetterResponse(letter),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/letters
 * Returns all letters created by the authenticated user.
 */
export async function getLetters(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const letters = await Letter.find({ userId: req.userId }).sort({
      scheduledDeliveryTimestamp: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      letters: letters.map((l) => formatLetterResponse(l)),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/letters/:id
 * Retrieves a single letter owned by the authenticated user.
 */
export async function getLetterById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const letter = await Letter.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!letter) {
      res.status(404).json({
        success: false,
        message: 'Letter not found or does not belong to your account',
      });
      return;
    }

    res.status(200).json({
      success: true,
      letter: formatLetterResponse(letter),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/letters/:id
 * Deletes a letter owned by the authenticated user.
 */
export async function deleteLetter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await Letter.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Letter not found or does not belong to your account',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Letter deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/letters/:id/retry
 * Re-queues a failed or unconfigured letter for delivery.
 */
export async function retryLetterDelivery(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const letter = await Letter.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!letter) {
      res.status(404).json({
        success: false,
        message: 'Letter not found or does not belong to your account',
      });
      return;
    }

    letter.status = 'SCHEDULED';
    letter.deliveryFailureReason = undefined;
    await letter.save();

    triggerSchedulerNow();

    res.status(200).json({
      success: true,
      message: 'Letter delivery queued for retry',
      letter: formatLetterResponse(letter),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/letters/public/:token
 * Public endpoint for recipients.
 * Computes SHA-256(token) to lookup letter.
 * Masks content before delivery moment.
 */
export async function getPublicLetterByToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawToken = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;

    if (!rawToken || !rawToken.trim()) {
      res.status(400).json({ success: false, message: 'Letter token is required.' });
      return;
    }

    const tokenHash = hashToken(rawToken);
    const letter = await Letter.findOne({ publicTokenHash: tokenHash });

    if (!letter) {
      res.status(404).json({
        success: false,
        message: 'Letter not found or expired link.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      letter: formatPublicLetterResponse(letter, rawToken),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/letters/public/:token/open
 * Public endpoint to unseal and read an unlocked letter.
 */
export async function openPublicLetterByToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawToken = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;

    if (!rawToken || !rawToken.trim()) {
      res.status(400).json({ success: false, message: 'Letter token is required.' });
      return;
    }

    const tokenHash = hashToken(rawToken);
    const letter = await Letter.findOne({ publicTokenHash: tokenHash });

    if (!letter) {
      res.status(404).json({
        success: false,
        message: 'Letter not found or expired link.',
      });
      return;
    }

    const now = Date.now();
    const isDeliverable =
      now >= letter.scheduledDeliveryTimestamp ||
      letter.status === 'DELIVERED' ||
      letter.status === 'OPENED';

    if (!isDeliverable) {
      res.status(400).json({
        success: false,
        message: 'This letter is still sealed and cannot be opened yet.',
      });
      return;
    }

    // Mark opened if not already opened
    if (letter.status !== 'OPENED') {
      letter.status = 'OPENED';
      letter.openedAt = new Date();
      await letter.save();
    }

    res.status(200).json({
      success: true,
      letter: formatPublicLetterResponse(letter, rawToken, true),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/letters/public/:token/fast-forward
 * Fast-forwards the delivery timestamp for instant testing.
 */
export async function fastForwardPublicLetter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawToken = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    const tokenHash = hashToken(rawToken);
    const letter = await Letter.findOne({ publicTokenHash: tokenHash });

    if (!letter) {
      res.status(404).json({ success: false, message: 'Letter not found.' });
      return;
    }

    letter.scheduledDeliveryTimestamp = Date.now() - 1000;
    await letter.save();

    triggerSchedulerNow();

    res.status(200).json({
      success: true,
      letter: formatPublicLetterResponse(letter, rawToken, true),
    });
  } catch (error) {
    next(error);
  }
}
