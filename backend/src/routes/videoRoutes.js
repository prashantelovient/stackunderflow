import express from 'express';
import { uploadVideo, createVideoFromS3, getVideos, getVideoById, updateVideo, deleteVideo } from '../controllers/videoController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../utils/localUpload.js';

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/upload',
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  uploadVideo
);

router.post('/s3-create', createVideoFromS3);


router.get('/', getVideos);
router.get('/:id', getVideoById);
router.put(
  '/:id',
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  updateVideo
);
router.delete('/:id', deleteVideo);

export default router;
