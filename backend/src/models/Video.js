import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  videoPath: { type: String, default: '' },
  thumbnail: { type: String, default: null },
  duration: { type: Number, default: null },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', default: null },
  status: { type: String, default: 'processing' },
  s3Key: { type: String, default: null }, // Original video key in S3
  createdAt: { type: Date, default: Date.now },
});


applySchemaTransform(VideoSchema);

export default mongoose.model('Video', VideoSchema);
