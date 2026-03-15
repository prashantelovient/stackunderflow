import express from 'express';
import { saveProgress, getProgress, getAllProgress } from '../controllers/progressController.js';
import { studentAuthMiddleware } from '../middleware/studentAuthMiddleware.js';

const router = express.Router();

router.use(studentAuthMiddleware);

router.post('/', saveProgress);
router.get('/:videoId', getProgress);
router.get('/', getAllProgress);

export default router;
