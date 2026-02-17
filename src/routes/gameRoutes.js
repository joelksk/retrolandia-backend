import express from 'express'
const router = express.Router();
import {getGames, 
        getGameBySlug, 
        uploadGamesSega,
        incrementPlayCount,
        rateGame,
        uploadGamesNes,
        uploadGamesSnes,
        getSitemapData, 
        getRecentsGames} from '../controllers/gameController.js'

router.get('/', getGames);
router.get('/details/:slug', getGameBySlug);
router.get('/recents', getRecentsGames);

//Carga de Roms
router.post('/sync-segaMD', uploadGamesSega);
router.post('/sync-nes', uploadGamesNes);
router.post('/sync-snes', uploadGamesSnes);


router.post('/:id/play', incrementPlayCount);
router.post('/:id/rate', rateGame);

//Sitemap
router.get('/sitemap-data', getSitemapData);

export default router