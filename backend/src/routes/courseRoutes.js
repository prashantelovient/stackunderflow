import express from 'express';
import { createCourse, getCourses, getCourseById, updateCourse, deleteCourse } from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../utils/localUpload.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', upload.single('thumbnail'), createCourse);
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.put('/:id', upload.single('thumbnail'), updateCourse);
router.delete('/:id', deleteCourse);

export default router;
