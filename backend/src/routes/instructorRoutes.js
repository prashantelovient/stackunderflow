import express from 'express';
import { getInstructorAnalytics, getMyStudents, getMyEnrollments, updateEnrollmentStatus } from '../controllers/instructorController.js';
import { getInstructorRevenue } from '../controllers/purchaseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/analytics', getInstructorAnalytics);
router.get('/revenue', getInstructorRevenue);
router.get('/students', getMyStudents);
router.get('/enrollments', getMyEnrollments);
router.patch('/enrollments/:id', updateEnrollmentStatus);


export default router;
