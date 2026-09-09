import { Router } from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updateUserSettings,
  migrateLocalData,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected user routes
router.get('/me', requireAuth, getMe);
router.put('/settings', requireAuth, updateUserSettings);
router.post('/migrate-local-data', requireAuth, migrateLocalData);

export default router;
