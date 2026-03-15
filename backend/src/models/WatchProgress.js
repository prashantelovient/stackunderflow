import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const WatchProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

WatchProgressSchema.pre('save', function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

applySchemaTransform(WatchProgressSchema);

export default mongoose.model('WatchProgress', WatchProgressSchema);
