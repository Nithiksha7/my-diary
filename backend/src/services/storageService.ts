import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UploadResult {
  url: string;
  storageKey: string;
}

export interface StorageProvider {
  name: string;
  uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
  deleteFile(storageKey: string): Promise<boolean>;
}

/**
 * 1. Local Disk Storage Provider (Development Only)
 * Writes files safely to the uploads directory on the server disk
 */
export class LocalStorageProvider implements StorageProvider {
  name = 'Local Disk Storage';
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.resolve(process.cwd(), 'uploads');
    this.ensureUploadsDir();
  }

  private ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'photos'): Promise<UploadResult> {
    this.ensureUploadsDir();

    const targetFolder = path.join(this.uploadsDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // Extract safe extension from original name
    const rawExt = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'].includes(rawExt)
      ? rawExt
      : '.jpg';

    // Generate random unguessable filename
    const randomName = `${Date.now()}_${crypto.randomBytes(16).toString('hex')}${safeExt}`;
    const storageKey = path.join(folder, randomName).replace(/\\/g, '/');
    const destinationPath = path.join(this.uploadsDir, storageKey);

    // Write file buffer to disk
    if (file.buffer) {
      await fs.promises.writeFile(destinationPath, file.buffer);
    } else if (file.path) {
      await fs.promises.copyFile(file.path, destinationPath);
    }

    const publicUrl = `/uploads/${storageKey}`;
    return { url: publicUrl, storageKey };
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    try {
      const sanitizedKey = path.normalize(storageKey).replace(/^(\.\.(\/|\\|$))+/, '');
      const filePath = path.join(this.uploadsDir, sanitizedKey);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[LocalStorageProvider] File deletion error:', err);
      return false;
    }
  }
}

/**
 * 2. Cloud Storage Provider Stub (Production Cloudinary / S3 / R2)
 */
export class CloudStorageProvider implements StorageProvider {
  name = 'Cloud Storage Provider';

  async uploadFile(_file: Express.Multer.File, _folder?: string): Promise<UploadResult> {
    throw new Error('CloudStorageProvider requires CLOUDINARY_URL or S3_BUCKET configuration in production.');
  }

  async deleteFile(_storageKey: string): Promise<boolean> {
    return false;
  }
}

/**
 * Provider factory based on environment
 */
function createStorageService(): StorageProvider {
  if (process.env.STORAGE_PROVIDER === 'cloud' && process.env.NODE_ENV === 'production') {
    return new CloudStorageProvider();
  }
  return new LocalStorageProvider();
}

export const storageService = createStorageService();
