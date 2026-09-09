import type { Response, NextFunction } from 'express';
import { Someday, type ISomeday } from '../models/Someday.js';
import { UploadedFile } from '../models/UploadedFile.js';
import { storageService } from '../services/storageService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

function formatSomedayResponse(dream: ISomeday) {
  return {
    id: dream._id.toString(),
    title: dream.title,
    description: dream.description,
    category: dream.category,
    imageUrl: dream.imageUrl,
    storageKey: dream.storageKey,
    targetDate: dream.targetDate,
    completed: dream.completed,
    completedAt: dream.completedAt,
    notes: dream.notes,
    createdAt: dream.createdAt,
    updatedAt: dream.updatedAt,
  };
}

/**
 * GET /api/someday
 * Returns all someday dreams for the authenticated user
 */
export async function getSomedayDreams(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dreams = await Someday.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      dreams: dreams.map(formatSomedayResponse),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/someday
 * Creates a new someday dream for the authenticated user
 */
export async function createSomedayDream(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title, description, category = 'places', imageUrl, storageKey, targetDate } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Dream title is required.' });
      return;
    }

    const validCategories = ['places', 'experiences', 'learning', 'try', 'little', 'big'];
    const safeCategory = validCategories.includes(category) ? category : 'places';

    const dream = await Someday.create({
      userId: req.userId,
      title: title.trim(),
      description: description?.trim() || undefined,
      category: safeCategory,
      imageUrl: imageUrl || undefined,
      storageKey: storageKey?.trim() || undefined,
      targetDate: targetDate?.trim() || undefined,
      completed: false,
    });

    res.status(201).json({
      success: true,
      message: 'Dream saved successfully',
      dream: formatSomedayResponse(dream),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/someday/:id/toggle
 * Toggles completion status of a someday dream
 */
export async function toggleSomedayDream(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { notes } = req.body;

    const dream = await Someday.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!dream) {
      res.status(404).json({
        success: false,
        message: 'Dream not found or does not belong to your account',
      });
      return;
    }

    dream.completed = !dream.completed;
    if (dream.completed) {
      const now = new Date();
      dream.completedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    } else {
      dream.completedAt = undefined;
    }

    if (notes !== undefined) {
      dream.notes = notes.trim() || undefined;
    }

    await dream.save();

    res.status(200).json({
      success: true,
      message: dream.completed ? 'Dream marked as lived! ✨' : 'Dream marked as active',
      dream: formatSomedayResponse(dream),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/someday/:id
 * Updates an existing dream
 */
export async function updateSomedayDream(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, description, category, imageUrl, storageKey, targetDate, notes } = req.body;

    const dream = await Someday.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!dream) {
      res.status(404).json({
        success: false,
        message: 'Dream not found or does not belong to your account',
      });
      return;
    }

    if (title) dream.title = title.trim();
    if (description !== undefined) dream.description = description.trim() || undefined;
    if (category) {
      const validCategories = ['places', 'experiences', 'learning', 'try', 'little', 'big'];
      if (validCategories.includes(category)) dream.category = category;
    }
    if (imageUrl !== undefined) dream.imageUrl = imageUrl || undefined;
    if (storageKey !== undefined) dream.storageKey = storageKey.trim() || undefined;
    if (targetDate !== undefined) dream.targetDate = targetDate.trim() || undefined;
    if (notes !== undefined) dream.notes = notes.trim() || undefined;

    await dream.save();

    res.status(200).json({
      success: true,
      message: 'Dream updated successfully',
      dream: formatSomedayResponse(dream),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/someday/:id
 * Deletes a dream owned by the authenticated user and cleans up the stored photo
 */
export async function deleteSomedayDream(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const dream = await Someday.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!dream) {
      res.status(404).json({
        success: false,
        message: 'Dream not found or does not belong to your account',
      });
      return;
    }

    // Clean up stored image file if storageKey is present
    if (dream.storageKey) {
      try {
        await storageService.deleteFile(dream.storageKey);
        await UploadedFile.deleteOne({ userId: req.userId, storageKey: dream.storageKey });
      } catch (fileErr) {
        console.error('[SomedayController] Non-fatal error cleaning up file on disk:', fileErr);
      }
    }

    await Someday.deleteOne({ _id: dream._id });

    res.status(200).json({
      success: true,
      message: 'Dream deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
}
