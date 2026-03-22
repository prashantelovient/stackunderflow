import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const ParticipantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'participants.roleModel', required: true },
  roleModel: { type: String, required: true, enum: ['Admin', 'Instructor', 'Student'] },
  role: { type: String, required: true, enum: ['admin', 'instructor', 'student'] },
  name: { type: String, required: true },
});

const ConversationSchema = new mongoose.Schema({
  participants: [ParticipantSchema],
  type: { type: String, enum: ['private', 'group'], default: 'private' },
  isGlobal: { type: Boolean, default: false },
  name: { type: String }, // For group chats
  lastMessage: {
    text: String,
    senderId: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now },
  },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure conversation between the same set of users is unique
// (Simple two-user chat for now)
// We'll sort participant IDs before saving to make sure [u1, u2] === [u2, u1]

applySchemaTransform(ConversationSchema);

export default mongoose.model('Conversation', ConversationSchema);
