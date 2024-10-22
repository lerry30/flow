import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    getPlayerTransactionHistory,
    getTransactionHistory,
    deleteTransactionHistory,
} from '../controllers/transactionController.js';

const router = express.Router();

router.post('/player', protect, getPlayerTransactionHistory);
router.post('/', protect, getTransactionHistory);
router.delete('/', protect, deleteTransactionHistory);

export default router;
