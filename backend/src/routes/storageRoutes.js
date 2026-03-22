import express from 'express';
import { getUploadUrl, getThumbnail } from '../controllers/storageController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only authenticated admins or instructors can get a signed upload URL
router.post('/upload-url', authMiddleware, getUploadUrl);

// Public route to get a thumbnail from S3 (via our proxy)
router.get('/thumbnail', getThumbnail);


export default router;
