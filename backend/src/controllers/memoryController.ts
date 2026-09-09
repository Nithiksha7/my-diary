import type { Response, NextFunction } from 'express';
import { Memory, type IMemory } from '../models/Memory.js';
import { UploadedFile } from '../models/UploadedFile.js';
import { storageService } from '../services/storageService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

function formatMemoryResponse(mem: IMemory) {
  return {
    id: mem._id.toString(),
    photoUrl: mem.photoUrl,
    storageKey: mem.storageKey,
    caption: mem.caption,
    date: mem.date,
    location: mem.location,
    notes: mem.notes,
    song: mem.song,
    createdAt: mem.createdAt,
    updatedAt: mem.updatedAt,
  };
}

/**
 * GET /api/memories
 * Returns all memories for the authenticated user, sorted by date desc
 */
export async function getMemories(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const memories = await Memory.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      memories: memories.map(formatMemoryResponse),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/memories
 * Creates a new memory moment for the authenticated user
 */
export async function createMemory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { photoUrl, storageKey, caption, date, location, notes, song } = req.body;

    if (!photoUrl || !photoUrl.trim()) {
      res.status(400).json({ success: false, message: 'Photo is required for a memory moment.' });
      return;
    }

    if (!caption || !caption.trim()) {
      res.status(400).json({ success: false, message: 'Caption is required for a memory moment.' });
      return;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ success: false, message: 'Valid date in format YYYY-MM-DD is required.' });
      return;
    }

    const memory = await Memory.create({
      userId: req.userId,
      photoUrl: photoUrl.trim(),
      storageKey: storageKey?.trim() || undefined,
      caption: caption.trim(),
      date,
      location: location?.trim() || undefined,
      notes: notes?.trim() || undefined,
      song: song?.trim() || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Memory saved successfully',
      memory: formatMemoryResponse(memory),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/memories/:id
 * Updates an existing memory owned by the authenticated user
 */
export async function updateMemory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { photoUrl, storageKey, caption, date, location, notes, song } = req.body;

    const memory = await Memory.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!memory) {
      res.status(404).json({
        success: false,
        message: 'Memory not found or does not belong to your account',
      });
      return;
    }

    if (photoUrl) memory.photoUrl = photoUrl.trim();
    if (storageKey !== undefined) memory.storageKey = storageKey.trim() || undefined;
    if (caption) memory.caption = caption.trim();
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) memory.date = date;
    if (location !== undefined) memory.location = location.trim() || undefined;
    if (notes !== undefined) memory.notes = notes.trim() || undefined;
    if (song !== undefined) memory.song = song.trim() || undefined;

    await memory.save();

    res.status(200).json({
      success: true,
      message: 'Memory updated successfully',
      memory: formatMemoryResponse(memory),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/memories/:id
 * Deletes a memory owned by the authenticated user and cleans up the stored photo
 */
export async function deleteMemory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const memory = await Memory.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!memory) {
      res.status(404).json({
        success: false,
        message: 'Memory not found or does not belong to your account',
      });
      return;
    }

    // Clean up stored image file if storageKey is present
    if (memory.storageKey) {
      try {
        await storageService.deleteFile(memory.storageKey);
        await UploadedFile.deleteOne({ userId: req.userId, storageKey: memory.storageKey });
      } catch (fileErr) {
        console.error('[MemoryController] Non-fatal error cleaning up file on disk:', fileErr);
      }
    }

    await Memory.deleteOne({ _id: memory._id });

    res.status(200).json({
      success: true,
      message: 'Memory deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
}
