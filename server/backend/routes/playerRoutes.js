import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import { 
    addNewPlayer,
    getPlayers,
    getPlayer,
    search
} from '../controllers/playerController.js';

const router = express.Router();

router.post('/add', protect, addNewPlayer);
router.post('/', protect, getPlayers);
router.post('/player', protect, getPlayer);
router.post('/search', protect, search);

export default router;
