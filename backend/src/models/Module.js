import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const ModuleSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

ModuleSchema.virtual('lectures', {
    ref: 'Lecture',
    localField: '_id',
    foreignField: 'moduleId',
});

applySchemaTransform(ModuleSchema);

export default mongoose.model('Module', ModuleSchema);
