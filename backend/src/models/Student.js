import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  enrolledCourses: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    default: [],
  },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

applySchemaTransform(StudentSchema);

export default mongoose.model('Student', StudentSchema);
