import mongoose from 'mongoose';
import { Course, Module, Lecture, Student, Enrollment, WatchProgress, Purchase } from '../models/index.js';

export const createCourse = async (req, res, next) => {
    try {
        const { title, description, categoryId, price } = req.body;
        const thumbnailFile = req.file;
        const thumbnailPath = thumbnailFile ? `/thumbnails/${thumbnailFile.filename}` : req.body.thumbnail;

        const categoryObjectId = categoryId && mongoose.Types.ObjectId.isValid(categoryId) ? categoryId : null;

        const course = await Course.create({
            title,
            description,
            thumbnail: thumbnailPath,
            categoryId: categoryObjectId,
            price: Number(price) || 0,
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
                    populate: { path: 'videoId', select: 'title thumbnail status' },
                },
            })
            .exec();

        let studentEnrolledCourses = [];
        let pendingCourses = [];
        if (req.user.role === 'student') {
            const enrollments = await Enrollment.find({ studentId: req.user.id });
            studentEnrolledCourses = enrollments.filter(e => e.status === 'approved').map(e => e.courseId.toString());
            pendingCourses = enrollments.filter(e => e.status === 'pending').map(e => e.courseId.toString());
            const purchases = await Purchase.find({ userId: req.user.id });
            const purchasedCourseIds = purchases.map(p => p.courseId.toString());
            
            courses.forEach(c => {
                c._isPurchased = purchasedCourseIds.includes(c._id.toString());
            });
        }

        const formatted = courses.map(c => {
            const obj = c.toObject();
            const modules = obj.modules || [];
            const lectureCount = modules.reduce((sum, m) => sum + (m.lectures ? m.lectures.length : 0), 0);

            let isEnrolled = false;
            let isPending = false;
            if (req.user.role === 'student') {
                isEnrolled = studentEnrolledCourses.includes(c._id.toString());
                isPending = pendingCourses.includes(c._id.toString());
            } else if (req.user.role === 'admin' || (req.user.role === 'instructor' && c.instructorId?.toString() === req.user.id)) {
                isEnrolled = true;
            }

            return {
                ...obj,
                isEnrolled,
                isPending,
                isPurchased: c._isPurchased || false,

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
                    populate: { path: 'videoId', select: 'title thumbnail status videoPath' },
                },
            })
            .exec();

        if (!c) return res.status(404).json({ message: 'Course not found' });

        const obj = c.toObject();
        const modules = obj.modules || [];
        const lectureCount = modules.reduce((sum, m) => sum + (m.lectures ? m.lectures.length : 0), 0);

        // Check enrollment if current user is a student
        let isEnrolled = false;
        let isPending = false;
        let isPurchased = false; // Initialize isPurchased
        if (req.user.role === 'student' || !req.user.role) {
            const enrollment = await Enrollment.findOne({ studentId: req.user.id, courseId: req.params.id });
            if (enrollment) {
                isEnrolled = enrollment.status === 'approved';
                isPending = enrollment.status === 'pending';
            }
            const purchase = await Purchase.findOne({ userId: req.user.id, courseId: req.params.id });
            isPurchased = !!purchase;
        } else if (req.user.role === 'admin' || (req.user.role === 'instructor' && c.instructorId?.toString() === req.user.id)) {
            isEnrolled = true;
        }

        const formatted = {
            ...obj,
            isEnrolled,
            isPending,
            isPurchased: isPurchased || false,

            categoryId: c.categoryId ? (c.categoryId.id || c.categoryId._id?.toString?.()) : null,
            category: c.categoryId ? c.categoryId.name : 'Uncategorized',
            moduleCount: modules.length,
            lectureCount,
        };

        // Redact paths/sensitive info if not enrolled
        if (!isEnrolled) {
            formatted.modules = formatted.modules.map(m => ({
                ...m,
                lectures: m.lectures.map(l => ({
                    ...l,
                    videoId: l.videoId ? {
                        title: l.videoId.title,
                        thumbnail: l.videoId.thumbnail,
                        status: l.videoId.status,
                        // No videoPath
                    } : null
                }))
            }));
        }

        res.json(formatted);
    } catch (error) {
        next(error);
    }
};

export const updateCourse = async (req, res, next) => {
    try {
        const { title, description, categoryId, price } = req.body;
        const thumbnailFile = req.file;

        const updateData = {
            title,
            description,
            categoryId: categoryId && mongoose.Types.ObjectId.isValid(categoryId) ? categoryId : null,
            price: price !== undefined ? Number(price) : undefined,
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

        // Find all lectures to get videoIds for progress deletion
        const lectures = await Lecture.find({ moduleId: { $in: moduleIds } }).exec();
        const videoIds = lectures.map(l => l.videoId).filter(id => id);

        if (videoIds.length > 0) {
            await WatchProgress.deleteMany({ videoId: { $in: videoIds } }).exec();
        }

        await Lecture.deleteMany({ moduleId: { $in: moduleIds } }).exec();
        await Module.deleteMany({ courseId: req.params.id }).exec();

        // Delete all enrollments for this course
        await Enrollment.deleteMany({ courseId: req.params.id }).exec();

        // Remove course from all students' enrolledCourses
        await Student.updateMany(
            { enrolledCourses: req.params.id },
            { $pull: { enrolledCourses: req.params.id } }
        ).exec();

        await Course.findByIdAndDelete(req.params.id).exec();

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        next(error);
    }
};
