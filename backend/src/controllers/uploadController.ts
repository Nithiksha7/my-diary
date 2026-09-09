import type { Response, NextFunction } from 'express';
import { storageService } from '../services/storageService.js';
import { UploadedFile } from '../models/UploadedFile.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function handleFileUpload(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No photograph file was provided. Please attach a photograph.',
      });
      return;
    }

    // 1. Process upload through storage provider (disk in dev, cloud in prod)
    const uploadResult = await storageService.uploadFile(req.file, 'photos');

    // 2. Save file metadata in MongoDB
    const uploadedRecord = await UploadedFile.create({
      userId: req.userId,
      url: uploadResult.url,
      storageKey: uploadResult.storageKey,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: 'Photograph uploaded successfully',
      id: uploadedRecord._id.toString(),
      url: uploadedRecord.url,
      storageKey: uploadedRecord.storageKey,
      file: {
        id: uploadedRecord._id.toString(),
        url: uploadedRecord.url,
        storageKey: uploadedRecord.storageKey,
        mimeType: uploadedRecord.mimeType,
        size: uploadedRecord.size,
      },
    });
  } catch (error) {
    next(error);
  }
}
