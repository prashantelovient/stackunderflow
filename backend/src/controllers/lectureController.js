import mongoose from 'mongoose';
import { Lecture } from '../models/index.js';

export const createLecture = async (req, res, next) => {
    try {
        const { title, description, moduleId, type, videoId, resourceUrl, resourceName, order } = req.body;

        if (!moduleId || !mongoose.Types.ObjectId.isValid(moduleId)) {
            return res.status(400).json({ message: 'Valid moduleId is required' });
        }

        const videoObjectId = videoId && mongoose.Types.ObjectId.isValid(videoId) ? videoId : null;

        const lecture = await Lecture.create({
            title,
            description,
            moduleId,
            type: type || 'video',
            videoId: videoObjectId,
            resourceUrl: resourceUrl || null,
            resourceName: resourceName || null,
            order: order ?? 0,
        });

        res.status(201).json(lecture);
    } catch (error) {
        next(error);
    }
};

export const getLecturesByModule = async (req, res, next) => {
    try {
        const { moduleId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(moduleId)) {
            return res.status(400).json({ message: 'Invalid moduleId' });
        }

        const lectures = await Lecture.find({ moduleId })
            .sort({ order: 1 })
            .populate('videoId', 'title thumbnail status videoPath')
            .exec();

        res.json(lectures);
    } catch (error) {
        next(error);
    }
};

export const getLectureById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        const lecture = await Lecture.findById(req.params.id)
            .populate('videoId', 'title thumbnail status videoPath')
            .exec();

        if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

        res.json(lecture);
    } catch (error) {
        next(error);
    }
};

export const updateLecture = async (req, res, next) => {
    try {
        const { title, description, type, videoId, resourceUrl, resourceName, order } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        const videoObjectId = videoId && mongoose.Types.ObjectId.isValid(videoId) ? videoId : null;

        const lecture = await Lecture.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                type,
                videoId: videoObjectId,
                resourceUrl: resourceUrl || null,
                resourceName: resourceName || null,
                order,
            },
            { new: true }
        ).exec();

        if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

        res.json(lecture);
    } catch (error) {
        next(error);
    }
};

export const deleteLecture = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        await Lecture.findByIdAndDelete(req.params.id).exec();
        res.json({ message: 'Lecture deleted successfully' });
    } catch (error) {
        next(error);
    }
};
