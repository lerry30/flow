import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import { 
    getProfitNLoss,
    newProfitNLoss,
    selectedProfitNLoss,
    updateProfitNLoss,
    deleteProfitNLoss,
    getMonthOperations,
    getOverall,
    getNetToday,
} from '../controllers/profitNLossController.js';

const router = express.Router();

router.post('/add', protect, newProfitNLoss);
router.post('/selected', protect, selectedProfitNLoss);
router.post('/get', protect, getProfitNLoss);
router.post('/monthoperations', protect, getMonthOperations);
router.post('/overall', protect, getOverall);
router.post('/nettoday', protect, getNetToday);
router.put('/update', protect, updateProfitNLoss);
router.delete('/delete', protect, deleteProfitNLoss);

export default router;
