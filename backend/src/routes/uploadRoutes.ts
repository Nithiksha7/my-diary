import { Router } from 'express';
import { handleFileUpload } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = Router();

// POST /api/upload (Protected, Multipart form-data with field 'photo')
router.post('/', requireAuth, uploadSingleImage, handleFileUpload);

export default router;
