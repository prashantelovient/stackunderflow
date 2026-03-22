import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
  senderModel: { type: String, required: true, enum: ['Admin', 'Instructor', 'Student'] },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true, enum: ['admin', 'instructor', 'student'] },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'seenByModel' }],
  seenByModel: { type: String, enum: ['Admin', 'Instructor', 'Student'] },
});

applySchemaTransform(MessageSchema);

export default mongoose.model('Message', MessageSchema);
