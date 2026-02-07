import express from 'express';
import { getPendingScores, 
        approveScore, 
        rejectScore,
        getReports,
        deleteReport,
        getSuggestions,
        deleteSuggestion } from '../controllers/adminController.js';

const router = express.Router();

//RANKINGS
router.get('/pending-ranking', getPendingScores);
router.post('/approve/:id', approveScore);
router.delete('/reject/:id', rejectScore);

//REPORTS
router.get('/reports', getReports);
router.delete('/reports/:id', deleteReport);

//SUGGESTIONS
router.get('/suggestions', getSuggestions);
router.delete('/suggestions/:id', deleteSuggestion);

export default router;