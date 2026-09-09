import { Router } from 'express';
import {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
} from '../controllers/memoryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All memory routes strictly require authentication
router.use(requireAuth);

router.get('/', getMemories);
router.post('/', createMemory);
router.put('/:id', updateMemory);
router.delete('/:id', deleteMemory);

export default router;
