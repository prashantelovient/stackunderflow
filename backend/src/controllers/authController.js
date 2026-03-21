import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin, Student, Instructor } from '../models/index.js';

export const unifiedLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.toLowerCase();

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        let user = null;
        let userType = null;

        // Try finding in Admin collection
        user = await Admin.findOne({ email: normalizedEmail });
        if (user) {
            userType = user.role || 'admin';
        } else {
            // Try Instructor collection
            user = await Instructor.findOne({ email: normalizedEmail });
            if (user) {
                userType = 'instructor';
            } else {
                // Try Student collection
                user = await Student.findOne({ email: normalizedEmail });
                if (user) {
                    userType = 'student';
                }
            }
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: userType },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || (userType === 'admin' ? 'Administrator' : 'User'),
                role: userType
            },
        });

    } catch (error) {
        next(error);
    }
};

export const unifiedRegister = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const normalizedEmail = email?.toLowerCase();

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let existing = null;
        if (role === 'instructor') {
            existing = await Instructor.findOne({ email: normalizedEmail });
        } else if (role === 'student') {
            existing = await Student.findOne({ email: normalizedEmail });
        } else if (role === 'admin') {
            existing = await Admin.findOne({ email: normalizedEmail });
        }

        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let user = null;

        if (role === 'instructor') {
            user = await Instructor.create({
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role: 'instructor'
            });
        } else if (role === 'student') {
            user = await Student.create({
                name,
                email: normalizedEmail,
                password: hashedPassword
            });
        } else if (role === 'admin') {
            user = await Admin.create({
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role: 'admin'
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "Account created successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || name,
                role: user.role || role
            }
        });

    } catch (error) {
        next(error);
    }
};
