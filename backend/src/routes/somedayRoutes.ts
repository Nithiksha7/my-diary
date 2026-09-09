import { Router } from 'express';
import {
  getSomedayDreams,
  createSomedayDream,
  updateSomedayDream,
  toggleSomedayDream,
  deleteSomedayDream,
} from '../controllers/somedayController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All someday routes strictly require authentication
router.use(requireAuth);

router.get('/', getSomedayDreams);
router.post('/', createSomedayDream);
router.put('/:id', updateSomedayDream);
router.patch('/:id/toggle', toggleSomedayDream);
router.delete('/:id', deleteSomedayDream);

export default router;
