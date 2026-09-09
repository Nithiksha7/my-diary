import multer from 'multer';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

// Store file in memory buffer so storageService can dispatch to local disk or cloud
const storage = multer.memoryStorage();

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const mimeType = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();

  const isMimeValid = ALLOWED_MIME_TYPES.includes(mimeType);
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPG, JPEG, PNG, WEBP, and HEIC photographs are allowed.'
      )
    );
  }
}

const multerUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

export function uploadSingleImage(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const upload = multerUpload.single('photo');

  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          message: 'Photograph size exceeds the maximum limit of 15MB.',
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
      return;
    } else if (err) {
      res.status(400).json({
        success: false,
        message: err.message || 'File upload validation failed.',
      });
      return;
    }
    next();
  });
}
