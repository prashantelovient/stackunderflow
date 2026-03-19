import mongoose from 'mongoose';
import { Module, Lecture } from '../models/index.js';

export const createModule = async (req, res, next) => {
    try {
        const { title, description, courseId, order } = req.body;

        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Valid courseId is required' });
        }

        const mod = await Module.create({
            title,
            description,
            courseId,
            order: order ?? 0,
        });

        res.status(201).json(mod);
    } catch (error) {
        next(error);
    }
};

export const getModulesByCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid courseId' });
        }

        const modules = await Module.find({ courseId })
            .sort({ order: 1 })
            .populate({
                path: 'lectures',
                options: { sort: { order: 1 } },
                populate: { path: 'videoId', select: 'title thumbnail duration status' },
            })
            .exec();

        res.json(modules);
    } catch (error) {
        next(error);
    }
};

export const updateModule = async (req, res, next) => {
    try {
        const { title, description, order } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Module not found' });
        }

        const mod = await Module.findByIdAndUpdate(
            req.params.id,
            { title, description, order },
            { new: true }
        ).exec();

        if (!mod) return res.status(404).json({ message: 'Module not found' });

        res.json(mod);
    } catch (error) {
        next(error);
    }
};

export const deleteModule = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Delete all lectures in this module
        await Lecture.deleteMany({ moduleId: req.params.id }).exec();
        await Module.findByIdAndDelete(req.params.id).exec();

        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        next(error);
    }
};
