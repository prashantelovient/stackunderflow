import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin, Student, Video, Playlist, Blog } from '../models/index.js';

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });

  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {

    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });

  } catch (error) {
    next(error);
  }
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
      totalStudents,
      totalVideos,
      totalPlaylists,
      totalBlogs,
      studentAgg,
      videoAgg,
    ] = await Promise.all([
      Student.countDocuments(),
      Video.countDocuments(),
      Playlist.countDocuments(),
      Blog.countDocuments(),
      Student.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Video.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const buildMonthlyData = (agg) => {
      const dataMap = {};
      agg.forEach(({ _id, count }) => {
        dataMap[`${_id.year}-${_id.month}`] = count;
      });
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        return { month: MONTH_NAMES[d.getMonth()], count: dataMap[key] || 0 };
      });
    };

    res.json({
      totalStudents,
      totalVideos,
      totalPlaylists,
      totalBlogs,
      studentsByMonth: buildMonthlyData(studentAgg),
      videosByMonth: buildMonthlyData(videoAgg),
    });
  } catch (error) {
    next(error);
  }
};
