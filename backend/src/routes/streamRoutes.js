import express from 'express';
import { streamPlaylist, streamKey, streamSegment } from '../controllers/streamController.js';

const router = express.Router();

// Allow unrestricted streaming for now to avoid dealing with videojs bearer tokens headers
// Alternatively, keep authMiddleware but append token to the stream URL in the frontend.

router.get('/:videoId', streamPlaylist);
router.get('/:videoId/key', streamKey);
router.get('/:videoId/:segment', streamSegment);

export default router;
