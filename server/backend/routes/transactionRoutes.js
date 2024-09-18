import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    getPlayerTransactionHistory,
    getTransactionHistory
} from '../controllers/transactionController.js';

const router = express.Router();

router.post('/player', protect, getPlayerTransactionHistory);
router.post('/', protect, getTransactionHistory);

export default router;
