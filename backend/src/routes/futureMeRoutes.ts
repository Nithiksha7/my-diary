import { Router } from 'express';
import {
  getFutureLetters,
  getFutureLetterById,
  createFutureLetter,
  openFutureLetter,
  deleteFutureLetter,
} from '../controllers/futureMeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All future-me routes strictly require authentication
router.use(requireAuth);

router.get('/', getFutureLetters);
router.get('/:id', getFutureLetterById);
router.post('/', createFutureLetter);
router.patch('/:id/open', openFutureLetter);
router.delete('/:id', deleteFutureLetter);

export default router;
