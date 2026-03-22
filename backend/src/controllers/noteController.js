import mongoose from 'mongoose';
import { Note } from '../models/index.js';
import { deleteFile, getPresignedDownloadUrl } from '../utils/minioClient.js';

export const createNote = async (req, res, next) => {
    try {
        const { title, description, fileUrl, fileName, fileType, fileSize } = req.body;

        if (!fileUrl || !fileName) {
            return res.status(400).json({ message: 'File URL and original file name are required' });
        }

        const note = await Note.create({
            title,
            description,
            fileUrl,
            fileName,
            fileType,
            fileSize,
            instructorId: req.user.id,
        });

        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
};

export const getNotes = async (req, res, next) => {
    try {
        const query = {};
        if (req.user.role === 'instructor') {
            query.instructorId = req.user.id;
        }

        const notes = await Note.find(query).sort({ createdAt: -1 }).exec();
        res.json(notes);
    } catch (error) {
        next(error);
    }
};

export const getNoteById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const note = await Note.findById(req.params.id).exec();
        if (!note) return res.status(404).json({ message: 'Note not found' });

        res.json(note);
    } catch (error) {
        next(error);
    }
};

export const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id).exec();
        if (!note) return res.status(404).json({ message: 'Note not found' });

        if (req.user.role === 'instructor' && note.instructorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not own this note' });
        }

        // Delete file from S3
        if (note.fileUrl) {
            await deleteFile(note.fileUrl).catch(e => console.error('Failed to delete note file from S3:', e));
        }

        await Note.findByIdAndDelete(req.params.id).exec();
        res.json({ message: 'Note and associated file deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getNoteDownloadUrl = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id).exec();
        if (!note) return res.status(404).json({ message: 'Note not found' });

        const downloadUrl = await getPresignedDownloadUrl(note.fileUrl);
        res.json({ downloadUrl });
    } catch (error) {
        next(error);
    }
};
