import express from 'express';
import { getStudents, getStudentById, deleteStudent, suspendStudent, registerStudent, loginStudent } from '../controllers/studentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', loginStudent);

router.use(authMiddleware);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.delete('/:id', deleteStudent);
router.patch('/:id/suspend', suspendStudent);

export default router;
