import express from 'express';
import {updateGame} from '../controllers/gameController.js'
import {uploadGameRoms, uploadDataRawg} from '../controllers/syncController.js'
import { getPendingScores, 
        approveScore, 
        rejectScore,
        getReports,
        deleteReport,
        getSuggestions,
        deleteSuggestion } from '../controllers/adminController.js';

const router = express.Router();

//GAMES
router.put('/games/:id', updateGame);

//SYNCS
router.post('/sync-roms', uploadGameRoms);
router.post('/update-rawg', uploadDataRawg);


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