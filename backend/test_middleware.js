import mongoose from 'mongoose';
import { Video, Enrollment, Student, Purchase, Course } from './src/models/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function testMiddleware() {
  await mongoose.connect(process.env.DATABASE_URL);
  
  const video = await Video.findOne({ courseId: { $ne: null } });
  if (!video) {
    console.log('No video with courseId found');
    process.exit(0);
  }
  
  const student = await Student.findOne({});
  if (!student) {
    console.log('No student found');
    process.exit(0);
  }
  
  console.log(`Video: ${video._id} (Course: ${video.courseId})`);
  console.log(`Student: ${student._id}`);
  
  // Simulate requirePurchase
  const userId = student._id.toString();
  const videoId = video._id.toString();
  
  // 1. Resolve video
  const v = await Video.findById(videoId);
  const idToCheck = v.courseId;
  console.log(`Resolving video success: ${!!v}. idToCheck: ${idToCheck}`);
  
  // 2. Check enrollment
  const enrollment = await Enrollment.findOne({ studentId: userId, courseId: idToCheck });
  console.log(`Enrollment found: ${!!enrollment}. Status: ${enrollment?.status}`);
  
  // 3. Final decision
  let decision = 'DENIED';
  if (enrollment && enrollment.status === 'approved') {
    decision = 'ALLOWED';
  } else {
    const course = await Course.findById(idToCheck);
    if (course && course.price === 0) {
       decision = 'DENIED (Free but not enrolled)';
    } else if (course && course.price > 0) {
       const purchase = await Purchase.findOne({ userId, courseId: idToCheck });
       decision = purchase ? 'ALLOWED (Purchased but not enrolled)' : 'DENIED (Not purchased)';
    }
  }
  
  console.log(`DECISION: ${decision}`);
  
  await mongoose.disconnect();
}

testMiddleware().catch(console.error);
