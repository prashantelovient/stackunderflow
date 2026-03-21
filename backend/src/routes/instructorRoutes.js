import express from 'express';
import { getInstructorAnalytics, getMyStudents } from '../controllers/instructorController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/analytics', getInstructorAnalytics);
router.get('/students', getMyStudents);

export default router;
