import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  thumbnail: { type: String, default: null },
  content: { type: String, required: true },
  status: { type: String, default: 'draft' },
  createdAt: { type: Date, default: Date.now },
});

applySchemaTransform(BlogSchema);

export default mongoose.model('Blog', BlogSchema);
