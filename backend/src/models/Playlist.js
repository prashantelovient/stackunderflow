import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const PlaylistSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: null },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  createdAt: { type: Date, default: Date.now },
});

PlaylistSchema.virtual('videos', {
  ref: 'Video',
  localField: '_id',
  foreignField: 'playlistId',
});

applySchemaTransform(PlaylistSchema);

export default mongoose.model('Playlist', PlaylistSchema);
