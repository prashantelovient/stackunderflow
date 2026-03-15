import express from 'express';
import { createPlaylist, getPlaylists, getPlaylistById, updatePlaylist, deletePlaylist } from '../controllers/playlistController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createPlaylist);
router.get('/', getPlaylists);
router.get('/:id', getPlaylistById);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);

export default router;
