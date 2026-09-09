import { Router } from 'express';
import {
  createLetter,
  getLetters,
  getLetterById,
  deleteLetter,
  retryLetterDelivery,
  updateLetterRecipient,
  getPublicLetterByToken,
  openPublicLetterByToken,
  fastForwardPublicLetter,
} from '../controllers/letterController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// ==========================================
// PUBLIC ROUTES (No Authentication Required)
// ==========================================
router.get('/public/:token', getPublicLetterByToken);
router.post('/public/:token/open', openPublicLetterByToken);
router.post('/public/:token/fast-forward', fastForwardPublicLetter);

// ==========================================
// AUTHENTICATED ROUTES (Require HttpOnly Auth)
// ==========================================
router.get('/', requireAuth, getLetters);
router.post('/', requireAuth, createLetter);
router.get('/:id', requireAuth, getLetterById);
router.delete('/:id', requireAuth, deleteLetter);
router.post('/:id/retry', requireAuth, retryLetterDelivery);
router.patch('/:id/recipient', requireAuth, updateLetterRecipient);

export default router;
