import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { errorHandler } from './src/middleware/errorHandler.js';
import { connectDb, disconnectDb } from './src/utils/db.js';
import { ensureDefaultAdmin } from './src/utils/seedAdmin.js';

import adminRoutes from './src/routes/adminRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import videoRoutes from './src/routes/videoRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';
import moduleRoutes from './src/routes/moduleRoutes.js';
import lectureRoutes from './src/routes/lectureRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import streamRoutes from './src/routes/streamRoutes.js';
import progressRoutes from './src/routes/progressRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import instructorRoutes from './src/routes/instructorRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

/* Fix __dirname for ES modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Middleware */
app.use(cors());
app.use(express.json());

/* Static files */
app.use('/thumbnails', express.static(path.join(__dirname, 'uploads/thumbnails')));

/* Routes */
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/instructor', instructorRoutes);

/* Health Check */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
  });
});

/* Global Error Handler */
app.use(errorHandler);

/* Start server only after DB connects */
async function startServer() {
  try {
    await connectDb();
    console.log('Database connected');

    try {
      await ensureDefaultAdmin();
    } catch (seedError) {
      console.error('Failed to seed default admin');
      console.error(seedError);
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}/api/health`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in backend/.env.`);
      } else if (err && err.code === 'EACCES') {
        console.error(`Port ${PORT} requires elevated privileges.`);
      } else {
        console.error('Server failed to start.');
        console.error(err);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to connect to database');
    console.error(error);
    process.exit(1);
  }
}

startServer();

async function shutdown(signal) {
  try {
    console.log(`Shutting down (${signal})...`);
    await disconnectDb();
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
