import express from 'express';
import { getPendingScores, approveScore, rejectScore } from '../controllers/adminController.js';

const router = express.Router();

router.get('/pending-ranking', getPendingScores);

router.post('/approve/:id', approveScore);

router.delete('/reject/:id', rejectScore);

export default router;