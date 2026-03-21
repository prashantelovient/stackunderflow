import express from 'express';
import { getInstructorAnalytics, getMyStudents, getMyEnrollments, updateEnrollmentStatus } from '../controllers/instructorController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/analytics', getInstructorAnalytics);
router.get('/students', getMyStudents);
router.get('/enrollments', getMyEnrollments);
router.patch('/enrollments/:id', updateEnrollmentStatus);


export default router;
