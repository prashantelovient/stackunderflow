import express from 'express';
import { createNote, getNotes, getNoteById, deleteNote, getNoteDownloadUrl } from '../controllers/noteController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All note routes require authentication
router.use(authMiddleware);

// Instructor-specific and shared routes
router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.delete('/:id', deleteNote);
router.get('/:id/download', getNoteDownloadUrl);

export default router;
