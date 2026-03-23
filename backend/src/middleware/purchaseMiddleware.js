import { Purchase, Video, Course, Enrollment, Lecture, Module } from '../models/index.js';

/**
 * Middleware to check if a student has purchased/enrolled in a course.
 * TEMPORARILY DISABLED FOR PRESENTATION: Always allows access.
 */
export const requirePurchase = async (req, res, next) => {
    // For presentation purposes, we are granting access to all authenticated users.
    // To restore restrictions, uncomment the logic below.
    return next();

    /*
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const { courseId, videoId, id } = req.params;

        // Instructors and Admins bypass purchase check
        if (role === 'instructor' || role === 'admin') {
            return next();
        }

        let idToCheck = courseId || req.query.courseId || req.query.course;

        // If videoId is provided, get courseId from the video model
        if (videoId) {
            const video = await Video.findById(videoId);
            if (!video) return res.status(404).json({ message: 'Video not found' });
            
            if (video.courseId) {
                idToCheck = video.courseId;
            } else if (!idToCheck) {
                // Fallback: If video has no direct courseId, try finding a lecture that uses it
                const studentEnrollments = await Enrollment.find({ studentId: userId, status: 'approved' });
                if (studentEnrollments.length > 0) {
                    const enrolledCourseIds = studentEnrollments.map(e => e.courseId);
                    const modules = await Module.find({ courseId: { $in: enrolledCourseIds } });
                    const moduleIds = modules.map(m => m._id);
                    const lecture = await Lecture.findOne({ videoId: video._id, moduleId: { $in: moduleIds } });
                    
                    if (lecture) return next();
                }
                
                const anyLecture = await Lecture.findOne({ videoId: video._id });
                if (anyLecture) {
                    const anyModule = await Module.findById(anyLecture.moduleId);
                    if (anyModule) idToCheck = anyModule.courseId;
                }
            }
        } else if (!idToCheck && id) {
             idToCheck = id;
        }

        if (!idToCheck) {
            return next(); // If we can't find a course, allow for now
        }

        const enrollment = await Enrollment.findOne({ studentId: userId, courseId: idToCheck });
        if (enrollment && enrollment.status === 'approved') {
            return next();
        }

        const course = await Course.findById(idToCheck);
        if (!course) return next();

        if (course.price > 0) {
            const purchase = await Purchase.findOne({ userId, courseId: idToCheck });
            if (purchase) return next();
        } else {
            // Free course, allow if they at least have an enrollment record
            if (enrollment) return next();
        }

        return res.status(403).json({ 
            success: false, 
            message: 'Access denied: Active enrollment required.',
            courseId: idToCheck
        });

    } catch (error) {
        console.error('Purchase middleware error:', error);
        next(); // Allow on error for demo
    }
    */
};
