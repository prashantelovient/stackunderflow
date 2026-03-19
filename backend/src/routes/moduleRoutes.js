import express from 'express';
import { createModule, getModulesByCourse, updateModule, deleteModule } from '../controllers/moduleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createModule);
router.get('/course/:courseId', getModulesByCourse);
router.put('/:id', updateModule);
router.delete('/:id', deleteModule);

export default router;
