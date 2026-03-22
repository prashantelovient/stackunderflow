import express from 'express';
import { createLecture, getLecturesByModule, getLectureById, getLectureResourceUrl, updateLecture, deleteLecture } from '../controllers/lectureController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createLecture);
router.get('/module/:moduleId', getLecturesByModule);
router.get('/:id', getLectureById);
router.get('/:id/resource', getLectureResourceUrl);
router.put('/:id', updateLecture);
router.delete('/:id', deleteLecture);

export default router;
