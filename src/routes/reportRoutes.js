import express from 'express';
const router = express.Router();
import {createReport} from '../controllers/reportController.js'

//POST api/reports
router.post('/', createReport);

export default router