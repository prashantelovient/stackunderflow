import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const InstructorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    role: { type: String, default: 'instructor' },
    createdAt: { type: Date, default: Date.now },
});

applySchemaTransform(InstructorSchema);

export default mongoose.model('Instructor', InstructorSchema);
