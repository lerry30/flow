import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import { 
    monthlyReport,
    weeklyReport,
} from '../controllers/reportController.js';

const router = express.Router();

router.post('/monthly', protect, monthlyReport);
router.post('/weekly', protect, weeklyReport);

export default router;
