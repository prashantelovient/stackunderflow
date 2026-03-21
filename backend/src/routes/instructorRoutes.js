import express from 'express';
import { getInstructorAnalytics } from '../controllers/instructorController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/analytics', getInstructorAnalytics);

export default router;
