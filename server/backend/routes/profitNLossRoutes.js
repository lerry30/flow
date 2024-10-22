import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import { 
    getProfitNLoss,
    newRevenue,
    newExpense,
    newX,
    selectedProfitNLoss,
    updateProfitNLoss,
    deleteProfitNLoss,
    getMonthOperations,
    getOverall,
    getLastNet,
} from '../controllers/profitNLossController.js';

const router = express.Router();

router.post('/get', protect, getProfitNLoss);
router.post('/add/revenue', protect, newRevenue);
router.post('/add/expense', protect, newExpense);
router.post('/add/x', protect, newX);
router.post('/selected', protect, selectedProfitNLoss);
router.post('/monthoperations', protect, getMonthOperations);
router.post('/overall', protect, getOverall);
router.post('/lastnet', protect, getLastNet);
router.put('/update', protect, updateProfitNLoss);
router.delete('/delete', protect, deleteProfitNLoss);

export default router;
