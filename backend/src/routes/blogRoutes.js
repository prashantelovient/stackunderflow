import express from 'express';
import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog } from '../controllers/blogController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../utils/localUpload.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', upload.single('thumbnail'), createBlog);
router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.put('/:id', upload.single('thumbnail'), updateBlog);
router.delete('/:id', deleteBlog);

export default router;
