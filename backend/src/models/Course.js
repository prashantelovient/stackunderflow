import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: null },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', default: null },
    createdAt: { type: Date, default: Date.now },
});

CourseSchema.virtual('modules', {
    ref: 'Module',
    localField: '_id',
    foreignField: 'courseId',
});

applySchemaTransform(CourseSchema);

export default mongoose.model('Course', CourseSchema);
