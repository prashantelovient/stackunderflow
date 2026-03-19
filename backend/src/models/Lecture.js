import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const LectureSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    type: { type: String, enum: ['video', 'resource', 'material'], default: 'video' },
    // For video lectures – references the Video model
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', default: null },
    // For resource/material lectures
    resourceUrl: { type: String, default: null },
    resourceName: { type: String, default: null },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

applySchemaTransform(LectureSchema);

export default mongoose.model('Lecture', LectureSchema);
