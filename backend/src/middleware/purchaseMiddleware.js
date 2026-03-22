import Purchase from '../models/Purchase.js';
import Video from '../models/Video.js';

export const requirePurchase = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const { courseId, videoId, id } = req.params;

        // Instructors and Admins bypass purchase check
        if (role === 'instructor' || role === 'admin') {
            return next();
        }

        let idToCheck = courseId || id;

        // If videoId is provided, get courseId from the video model
        if (!idToCheck && videoId) {
            const video = await Video.findById(videoId);
            if (!video) return res.status(404).json({ message: 'Video not found' });
            idToCheck = video.courseId;
        }

        if (!idToCheck) {
            return res.status(400).json({ success: false, message: 'courseId or videoId is required for this route' });
        }

        const purchase = await Purchase.findOne({ userId, courseId: idToCheck });

        if (!purchase) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: Course purchase required.',
                requiresPurchase: true,
                courseId: idToCheck
            });
        }

        next();
    } catch (error) {
        console.error('Purchase middleware error:', error);
        res.status(500).json({ success: false, message: 'Internal server error checking purchase' });
    }
};
