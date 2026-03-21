import mongoose from 'mongoose';
import { Course, Module, Lecture } from '../models/index.js';

export const createCourse = async (req, res, next) => {
    try {
        const { title, description, categoryId } = req.body;
        const thumbnailFile = req.file;
        const thumbnailPath = thumbnailFile ? `/thumbnails/${thumbnailFile.filename}` : req.body.thumbnail;

        const categoryObjectId = categoryId && mongoose.Types.ObjectId.isValid(categoryId) ? categoryId : null;

        const course = await Course.create({
            title,
            description,
            thumbnail: thumbnailPath,
            categoryId: categoryObjectId,
            instructorId: req.user.role === 'instructor' ? req.user.id : (req.body.instructorId || null),
        });

        res.status(201).json(course);
    } catch (error) {
        next(error);
    }
};

export const getCourses = async (req, res, next) => {
    try {
        const query = {};
        if (req.user.role === 'instructor') {
            query.instructorId = req.user.id;
        }

        const courses = await Course.find(query)
            .populate('categoryId', 'name')
            .populate({
                path: 'modules',
                populate: {
                    path: 'lectures',
                    populate: { path: 'videoId', select: 'title thumbnail duration status' },
                },
            })
            .exec();

        const formatted = courses.map(c => {
            const obj = c.toObject();
            const modules = obj.modules || [];
            const lectureCount = modules.reduce((sum, m) => sum + (m.lectures ? m.lectures.length : 0), 0);

            return {
                ...obj,
                categoryId: c.categoryId ? (c.categoryId.id || c.categoryId._id?.toString?.()) : null,
                category: c.categoryId ? c.categoryId.name : 'Uncategorized',
                moduleCount: modules.length,
                lectureCount,
            };
        });

        res.json(formatted);
    } catch (error) {
        next(error);
    }
};

export const getCourseById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const c = await Course.findById(req.params.id)
            .populate('categoryId', 'name')
            .populate({
                path: 'modules',
                options: { sort: { order: 1 } },
                populate: {
                    path: 'lectures',
                    options: { sort: { order: 1 } },
                    populate: { path: 'videoId', select: 'title thumbnail duration status videoPath' },
                },
            })
            .exec();

        if (!c) return res.status(404).json({ message: 'Course not found' });

        const obj = c.toObject();
        const modules = obj.modules || [];
        const lectureCount = modules.reduce((sum, m) => sum + (m.lectures ? m.lectures.length : 0), 0);

        const formatted = {
            ...obj,
            categoryId: c.categoryId ? (c.categoryId.id || c.categoryId._id?.toString?.()) : null,
            category: c.categoryId ? c.categoryId.name : 'Uncategorized',
            moduleCount: modules.length,
            lectureCount,
        };
        res.json(formatted);
    } catch (error) {
        next(error);
    }
};

export const updateCourse = async (req, res, next) => {
    try {
        const { title, description, categoryId } = req.body;
        const thumbnailFile = req.file;

        const updateData = {
            title,
            description,
            categoryId: categoryId && mongoose.Types.ObjectId.isValid(categoryId) ? categoryId : null,
        };

        if (thumbnailFile) {
            updateData.thumbnail = `/thumbnails/${thumbnailFile.filename}`;
        } else if (req.body.thumbnail !== undefined) {
            updateData.thumbnail = req.body.thumbnail;
        }

        const oldCourse = await Course.findById(req.params.id).exec();
        if (!oldCourse) return res.status(404).json({ message: 'Course not found' });

        if (req.user.role === 'instructor' && oldCourse.instructorId?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not own this course' });
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).exec();

        res.json(course);
    } catch (error) {
        next(error);
    }
};

export const deleteCourse = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const course = await Course.findById(req.params.id).exec();
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (req.user.role === 'instructor' && course.instructorId?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not own this course' });
        }

        // Delete all lectures in all modules of this course
        const modules = await Module.find({ courseId: req.params.id }).exec();
        const moduleIds = modules.map(m => m._id);
        await Lecture.deleteMany({ moduleId: { $in: moduleIds } }).exec();
        await Module.deleteMany({ courseId: req.params.id }).exec();
        await Course.findByIdAndDelete(req.params.id).exec();

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        next(error);
    }
};
