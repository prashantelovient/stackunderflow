import mongoose from 'mongoose';
import { Purchase, Course } from '../models/index.js';

export const createFakePurchase = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        if (!courseId) {
            return res.status(400).json({ success: false, message: 'courseId is required' });
        }

        // 1. Get course to check existence and price
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // 2. Check if already purchased
        const existingPurchase = await Purchase.findOne({ 
            userId, 
            courseId: new mongoose.Types.ObjectId(courseId) 
        });

        if (existingPurchase) {
            return res.status(400).json({ success: false, message: 'Asset already exists in your vault.', alreadyPurchased: true });
        }

        // 3. Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 4. Create purchase record
        const purchase = await Purchase.create({
            userId,
            courseId,
            amount: Number(course.price) || 0,
            paymentId: 'fake_' + Date.now()
        });

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

export const getInstructorRevenue = async (req, res, next) => {
    try {
        const id = req.user.id;
        if (!id) return res.status(401).json({ message: 'Unauthorized' });

        const instructorObjectId = new mongoose.Types.ObjectId(id);

        // Find all courses created by this instructor
        const instructorCourses = await Course.find({ instructorId: instructorObjectId }).select('_id title');
        
        if (!instructorCourses || instructorCourses.length === 0) {
            return res.json({
                totalRevenue: 0,
                totalSales: 0,
                courseWiseRevenue: [],
                monthlyRevenue: [],
                instructorId: id
            });
        }

        const courseIds = instructorCourses.map(c => c._id);
        const courseMap = {};
        instructorCourses.forEach(c => courseMap[c._id.toString()] = c.title);

        // Find all purchases for these courses
        const purchases = await Purchase.find({ courseId: { $in: courseIds } }).sort({ createdAt: 1 });

        // Totals
        const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalSales = purchases.length;

        // Course-wise revenue
        const courseStats = {};
        courseIds.forEach(id => {
            courseStats[id.toString()] = { 
                courseId: id.toString(), 
                courseTitle: courseMap[id.toString()], 
                revenue: 0, 
                sales: 0 
            };
        });

        purchases.forEach(p => {
            const cid = p.courseId.toString();
            if (courseStats[cid]) {
                courseStats[cid].revenue += (p.amount || 0);
                courseStats[cid].sales += 1;
            }
        });

        const courseWiseRevenue = Object.values(courseStats).filter(s => s.sales > 0);

        // Monthly revenue (last 6 months)
        const monthlyStats = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            monthlyStats[mKey] = { month: mKey, revenue: 0, sales: 0 };
        }

        purchases.forEach(p => {
            const date = new Date(p.createdAt);
            const mKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            if (monthlyStats[mKey]) {
                monthlyStats[mKey].revenue += (p.amount || 0);
                monthlyStats[mKey].sales += 1;
            }
        });

        const monthlyRevenue = Object.values(monthlyStats);

        res.json({
            totalRevenue,
            totalSales,
            courseWiseRevenue,
            monthlyRevenue,
            instructorId
        });
    } catch (error) {
        next(error);
    }
};
