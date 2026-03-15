import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  videoPath: { type: String, default: '' },
  thumbnail: { type: String, default: null },
  duration: { type: Number, default: null },
  playlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', default: null },
  status: { type: String, default: 'processing' },
  createdAt: { type: Date, default: Date.now },
});

applySchemaTransform(VideoSchema);

export default mongoose.model('Video', VideoSchema);
