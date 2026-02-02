import express from 'express';
const router = express.Router();
import { addComment, getCommentsByGame } from '../controllers/commentController.js';

router.post('/', addComment);
router.get('/:gameId', getCommentsByGame);

export default router;