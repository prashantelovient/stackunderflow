import Purchase from '../models/Purchase.js';
import Course from '../models/Course.js';

export const createFakePurchase = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        if (!courseId) {
            return res.status(400).json({ success: false, message: 'courseId is required' });
        }

        // 1. Check if already purchased
        const existingPurchase = await Purchase.findOne({ userId, courseId });
        if (existingPurchase) {
            return res.status(400).json({ success: false, message: 'Course already purchased', alreadyPurchased: true });
        }

        // 2. Get course price
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. Simulate payment
        const paymentSuccess = true;
        
        if (!paymentSuccess) {
            return res.status(402).json({ success: false, message: 'Fake payment failed' });
        }

        // 4. Save purchase
        const purchase = new Purchase({
            userId,
            courseId,
            amount: course.price || 0,
            paymentId: 'fake_' + Date.now(),
        });

        await purchase.save();

        res.status(201).json({
            success: true,
            message: 'Purchase successful',
            data: purchase,
        });

    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ success: false, message: 'Internal server error during purchase' });
    }
};

export const getUserPurchases = async (req, res) => {
    try {
        const userId = req.user.id;
        const purchases = await Purchase.find({ userId }).populate('courseId');
        res.json({ success: true, count: purchases.length, data: purchases });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching purchases' });
    }
};
