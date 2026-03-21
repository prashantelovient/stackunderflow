import { Course, Video, Student } from '../models/index.js';
import mongoose from 'mongoose';

export const getInstructorAnalytics = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const instructorObjectId = new mongoose.Types.ObjectId(instructorId);

        // 1. Get instructor's courses
        const courses = await Course.find({ instructorId: instructorObjectId });
        const courseIds = courses.map(c => c._id);

        // 2. Count total courses
        const totalCourses = courses.length;

        // 3. Count total students enrolled in these courses
        const totalStudents = await Student.countDocuments({
            enrolledCourses: { $in: courseIds }
        });

        // 4. Count total videos in these courses
        const modules = await mongoose.model('Module').find({ courseId: { $in: courseIds } });
        const moduleIds = modules.map(m => m._id);

        const lectures = await mongoose.model('Lecture').find({ moduleId: { $in: moduleIds } });
        const totalVideos = lectures.length;

        const totalRevenue = totalCourses * 1000;
        const avgRating = 4.8;

        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        const studentAgg = await Student.aggregate([
            {
                $match: {
                    enrolledCourses: { $in: courseIds },
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const buildMonthlyData = (agg) => {
            const dataMap = {};
            agg.forEach(({ _id, count }) => {
                dataMap[`${_id.year}-${_id.month}`] = count;
            });
            return Array.from({ length: 12 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
                const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
                return { name: MONTH_NAMES[d.getMonth()], count: dataMap[key] || 0 };
            });
        };

        res.json({
            totalStudents,
            totalCourses,
            totalVideos,
            totalRevenue: `$${totalRevenue}`,
            avgRating,
            studentsByMonth: buildMonthlyData(studentAgg),
            revenueData: buildMonthlyData([{ _id: { year: now.getFullYear(), month: now.getMonth() + 1 }, count: totalRevenue }])
                .map(d => ({ name: d.name, revenue: d.count })),
            recentStudents: [],
            topCourses: courses.slice(0, 3).map(c => ({
                id: c._id,
                name: c.title,
                sales: 0,
                revenue: '$0',
                rating: 4.5,
                thumbnail: c.thumbnail
            }))
        });

    } catch (error) {
        next(error);
    }
};

import Enrollment from '../models/Enrollment.js';

export const getMyEnrollments = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const enrollments = await Enrollment.find({ instructorId })
            .populate('studentId', 'name email')
            .populate('courseId', 'title thumbnail')
            .sort({ createdAt: -1 });

        res.json(enrollments);
    } catch (error) {
        next(error);
    }
};

export const updateEnrollmentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const instructorId = req.user.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const enrollment = await Enrollment.findOne({ _id: id, instructorId });
        if (!enrollment) return res.status(404).json({ message: 'Enrollment record not found or unauthorized' });

        enrollment.status = status;
        if (status === 'approved') {
            enrollment.approvalDate = new Date();
        }

        await enrollment.save();

        res.json({ message: `Enrollment status updated to ${status}` });
    } catch (error) {
        next(error);
    }
};

export const getMyStudents = async (req, res, next) => {
    try {
        const instructorId = req.user.id;

        // Find all approved enrollments for this instructor
        const enrollments = await Enrollment.find({ instructorId, status: 'approved' })
            .populate('studentId', '-password')
            .populate('courseId', 'title')
            .lean();

        // Group by student
        const studentMap = new Map();

        enrollments.forEach(e => {
            if (!e.studentId) return;
            const sId = e.studentId._id.toString();
            if (!studentMap.has(sId)) {
                studentMap.set(sId, {
                    ...e.studentId,
                    instructorCourses: [],
                    enrollmentCount: 0
                });
            }
            const s = studentMap.get(sId);
            s.instructorCourses.push(e.courseId ? e.courseId.title : 'Deleted Course');
            s.enrollmentCount += 1;
        });

        res.json(Array.from(studentMap.values()));

    } catch (error) {
        next(error);
    }
};

