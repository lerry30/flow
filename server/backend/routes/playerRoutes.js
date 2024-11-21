import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import { 
    addNewPlayer,
    getPlayers,
    getPlayer,
    search,
    updatePlayer,
} from '../controllers/playerController.js';

const router = express.Router();

router.post('/add', protect, addNewPlayer);
router.post('/', protect, getPlayers);
router.post('/player', protect, getPlayer);
router.post('/search', protect, search);
router.put('/update', protect, updatePlayer);

export default router;
