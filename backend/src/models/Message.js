import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
  senderModel: { type: String, required: true, enum: ['Admin', 'Instructor', 'Student'] },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true, enum: ['admin', 'instructor', 'student'] },
  message: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now },
});

applySchemaTransform(MessageSchema);

export default mongoose.model('Message', MessageSchema);
