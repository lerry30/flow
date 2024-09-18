import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    addRecord
} from '../controllers/recordController.js';

const router = express.Router();

router.put('/record', protect, addRecord);

export default router;
