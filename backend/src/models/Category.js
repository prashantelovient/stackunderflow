import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

applySchemaTransform(CategorySchema);

export default mongoose.model('Category', CategorySchema);
