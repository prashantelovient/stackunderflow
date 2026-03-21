import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'instructor'], default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

applySchemaTransform(AdminSchema);

export default mongoose.model('Admin', AdminSchema);
