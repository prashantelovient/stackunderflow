import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Student } from '../models/index.js';

export const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.toLowerCase();

    const existing = await Student.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, email: normalizedEmail, password: hashedPassword });

    res.status(201).json({ message: 'Student created successfully', student: { id: student.id, email: student.email, name: student.name } });
  } catch (error) {
    next(error);
  }
};

export const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase();

    const student = await Student.findOne({ email: normalizedEmail });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email, type: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, student: { id: student.id, email: student.email, name: student.name } });
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({}, 'name email createdAt enrolledCourses status').exec();
    const formatted = students.map(s => ({
      ...s.toObject(),
      joinDate: s.createdAt,
      enrolledCourse: s.enrolledCourses.length > 0 ? s.enrolledCourses[0] : 'None',
      status: s.status || 'active',
    }));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = await Student.findById(req.params.id, 'name email createdAt enrolledCourses status').exec();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      ...student.toObject(),
      joinDate: student.createdAt,
      enrolledCourse: student.enrolledCourses.length > 0 ? student.enrolledCourses[0] : 'None',
      status: student.status || 'active',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await Student.findByIdAndDelete(req.params.id).exec();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const suspendStudent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await Student.findByIdAndUpdate(req.params.id, { status: 'suspended' }).exec();
    res.json({ message: 'Student suspended successfully.' });
  } catch (error) {
    next(error);
  }
};

export const activateStudent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await Student.findByIdAndUpdate(req.params.id, { status: 'active' }).exec();
    res.json({ message: 'Student activated successfully.' });
  } catch (error) {
    next(error);
  }
};
