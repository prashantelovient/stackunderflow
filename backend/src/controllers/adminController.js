import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/index.js';

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
