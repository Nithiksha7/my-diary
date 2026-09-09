import type { Response, NextFunction } from 'express';
import { DiaryEntry, type IDiaryEntry } from '../models/DiaryEntry.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

function formatDiaryEntryResponse(entry: IDiaryEntry) {
  return {
    id: entry._id.toString(),
    date: entry.dateKey,
    dateKey: entry.dateKey,
    content: entry.content,
    oneSentence: entry.oneSentence,
    mood: entry.mood,
    littleThings: entry.littleThings,
    currently: entry.currently,
    photos: entry.photos,
    song: entry.song,
    isSpecial: entry.isSpecial,
    wordCount: entry.wordCount,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

/**
 * GET /api/diary/:date
 * Retrieves diary entry for a specific dateKey (YYYY-MM-DD)
 */
export async function getEntryByDate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const date = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD.',
      });
      return;
    }

    const entry = await DiaryEntry.findOne({
      userId: req.userId,
      dateKey: date,
    });

    if (!entry) {
      // Return clean empty template for this date
      res.status(200).json({
        success: true,
        entry: {
          date,
          dateKey: date,
          content: '',
          oneSentence: '',
          wordCount: 0,
          isSpecial: false,
          photos: [],
          isNew: true,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      entry: formatDiaryEntryResponse(entry),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/diary/:date
 * Creates or updates diary entry for a specific date (atomic upsert)
 */
export async function upsertEntryByDate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const date = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD.',
      });
      return;
    }

    const {
      content = '',
      oneSentence = '',
      mood,
      littleThings = {},
      currently = {},
      photos = [],
      song,
      isSpecial = false,
    } = req.body;

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const entry = await DiaryEntry.findOneAndUpdate(
      {
        userId: req.userId,
        dateKey: date,
      },
      {
        $set: {
          userId: req.userId,
          dateKey: date,
          content,
          oneSentence,
          mood,
          littleThings,
          currently,
          photos,
          song,
          isSpecial: Boolean(isSpecial),
          wordCount,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Diary entry saved successfully',
      entry: formatDiaryEntryResponse(entry),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/diary/:date
 * Deletes diary entry for a specific date
 */
export async function deleteEntryByDate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const date = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD.',
      });
      return;
    }

    const result = await DiaryEntry.findOneAndDelete({
      userId: req.userId,
      dateKey: date,
    });

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'No diary entry found for this date',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Diary entry deleted successfully',
      date,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/diary/month/:year/:month
 * Retrieves diary entry summaries for a whole month
 */
export async function getMonthEntries(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const year = Array.isArray(req.params.year) ? req.params.year[0] : req.params.year;
    const month = Array.isArray(req.params.month) ? req.params.month[0] : req.params.month;

    const formattedMonth = String(month).padStart(2, '0');
    const regex = new RegExp(`^${year}-${formattedMonth}-\\d{2}$`);

    const entries = await DiaryEntry.find({
      userId: req.userId,
      dateKey: { $regex: regex },
    }).select('dateKey mood isSpecial photos wordCount oneSentence content');

    const map: Record<
      string,
      { hasEntry: boolean; hasPhotos: boolean; isSpecial: boolean; mood?: string; wordCount: number }
    > = {};

    for (const e of entries) {
      const hasContent = Boolean(e.content?.trim() || e.oneSentence?.trim() || e.mood);
      const hasPhotos = Boolean(e.photos && e.photos.length > 0);
      map[e.dateKey] = {
        hasEntry: hasContent,
        hasPhotos,
        isSpecial: Boolean(e.isSpecial),
        mood: e.mood,
        wordCount: e.wordCount,
      };
    }

    res.status(200).json({
      success: true,
      year,
      month: formattedMonth,
      entries: map,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/diary/year/:year
 * Retrieves annual archive entry dates
 */
export async function getYearEntries(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const year = Array.isArray(req.params.year) ? req.params.year[0] : req.params.year;
    const regex = new RegExp(`^${year}-\\d{2}-\\d{2}$`);

    const entries = await DiaryEntry.find({
      userId: req.userId,
      dateKey: { $regex: regex },
    }).select('dateKey mood isSpecial photos wordCount');

    res.status(200).json({
      success: true,
      year,
      entries: entries.map((e) => ({
        dateKey: e.dateKey,
        mood: e.mood,
        isSpecial: e.isSpecial,
        hasPhotos: Boolean(e.photos && e.photos.length > 0),
        wordCount: e.wordCount,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/diary/on-this-day/:month/:day
 * Retrieves past year entries for the same Month & Day
 */
export async function getOnThisDayEntries(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const month = Array.isArray(req.params.month) ? req.params.month[0] : req.params.month;
    const day = Array.isArray(req.params.day) ? req.params.day[0] : req.params.day;
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const regex = new RegExp(`-\\${formattedMonth}-\\${formattedDay}$`);

    const currentYear = new Date().getFullYear();

    const entries = await DiaryEntry.find({
      userId: req.userId,
      dateKey: { $regex: regex },
    }).sort({ dateKey: -1 });

    // Filter out entries from the current year
    const pastEntries = entries.filter((e) => {
      const year = parseInt(e.dateKey.split('-')[0], 10);
      return year < currentYear && (e.content?.trim() || e.oneSentence?.trim());
    });

    res.status(200).json({
      success: true,
      entries: pastEntries.map(formatDiaryEntryResponse),
    });
  } catch (error) {
    next(error);
  }
}
