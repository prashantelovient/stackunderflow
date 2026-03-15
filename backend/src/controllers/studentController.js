import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';

export const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await prisma.student.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ message: 'Student created successfully', student: { id: student.id, email: student.email, name: student.name } });
  } catch (error) {
    next(error);
  }
};

export const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const student = await prisma.student.findUnique({ where: { email } });
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
    const students = await prisma.student.findMany({ select: { id: true, name: true, email: true, createdAt: true, enrolledPlaylists: true }});
    const formatted = students.map(s => ({
      ...s,
      joinDate: s.createdAt,
      enrolledPlaylist: s.enrolledPlaylists.length > 0 ? s.enrolledPlaylists[0] : 'None',
      status: 'active'
    }));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, createdAt: true, enrolledPlaylists: true }
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({
      ...student,
      joinDate: student.createdAt,
      enrolledPlaylist: student.enrolledPlaylists.length > 0 ? student.enrolledPlaylists[0] : 'None',
      status: 'active'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    await prisma.student.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const suspendStudent = async (req, res, next) => {
  try {
    res.json({ message: 'Student suspended successfully.' });
  } catch (error) {
    next(error);
  }
};
