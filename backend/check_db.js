import mongoose from 'mongoose';
import { Video, Enrollment, Student, Purchase, Course } from './src/models/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.DATABASE_URL);
  
  const videos = await Video.find({}).limit(10);
  const enrollments = await Enrollment.find({}).limit(10);
  const students = await Student.find({}).limit(10);
  const purchases = await Purchase.find({}).limit(10);
  const courses = await Course.find({}).limit(10);

  console.log(JSON.stringify({ 
    videos, 
    enrollments, 
    students, 
    purchases,
    courses
  }, null, 2));
  
  await mongoose.disconnect();
}

check().catch(console.error);
