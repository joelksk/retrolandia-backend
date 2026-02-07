import express from 'express';
const router = express.Router();
import {createSuggestion} from '../controllers/suggestionController.js'

//POST api/suggestions
router.post('/', createSuggestion);


export default router