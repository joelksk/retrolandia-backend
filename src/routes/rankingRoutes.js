import express from 'express';
const router = express.Router();
import {addRanking, getRankingsByGame, addPendingRanking} from '../controllers/rankingController.js'

router.post('/', addRanking);
router.post('/pending-ranking', addPendingRanking);
router.get('/:gameId', getRankingsByGame);

export default router;