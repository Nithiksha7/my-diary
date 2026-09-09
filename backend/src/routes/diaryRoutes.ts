import { Router } from 'express';
import {
  getEntryByDate,
  upsertEntryByDate,
  deleteEntryByDate,
  getMonthEntries,
  getYearEntries,
  getOnThisDayEntries,
} from '../controllers/diaryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All diary endpoints strictly require authenticated user
router.use(requireAuth);

// Query endpoints
router.get('/month/:year/:month', getMonthEntries);
router.get('/year/:year', getYearEntries);
router.get('/on-this-day/:month/:day', getOnThisDayEntries);

// Single date CRUD endpoints
router.get('/:date', getEntryByDate);
router.put('/:date', upsertEntryByDate);
router.delete('/:date', deleteEntryByDate);

export default router;
