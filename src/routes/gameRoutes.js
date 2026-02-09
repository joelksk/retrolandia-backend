import express from 'express'
const router = express.Router();
import {getGames, 
        getGameBySlug, 
        uploadGamesSega,
        incrementPlayCount,
        rateGame,
        uploadGamesNes,
        uploadGamesSnes } from '../controllers/gameController.js'

router.get('/', getGames);
router.get('/details/:slug', getGameBySlug);

//Carga de Roms
router.post('/sync-segaMD', uploadGamesSega);
router.post('/sync-nes', uploadGamesNes);
router.post('/sync-snes', uploadGamesSnes);


router.post('/:id/play', incrementPlayCount);
router.post('/:id/rate', rateGame);

export default router