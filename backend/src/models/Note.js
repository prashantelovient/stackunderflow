import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    fileUrl: { type: String, required: true }, // The URL or S3 key for the note file (PDF, etc.)
    fileName: { type: String, required: true }, // Original file name
    fileType: { type: String, default: 'application/pdf' }, // MIME type
    fileSize: { type: Number, default: 0 }, // Size in bytes
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
    createdAt: { type: Date, default: Date.now },
});

applySchemaTransform(NoteSchema);

export default mongoose.model('Note', NoteSchema);
