import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './src/middleware/errorHandler.js';

import adminRoutes from './src/routes/adminRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import videoRoutes from './src/routes/videoRoutes.js';
import playlistRoutes from './src/routes/playlistRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import streamRoutes from './src/routes/streamRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static files for thumbnails and any static uploads
app.use('/thumbnails', express.static(path.join(__dirname, 'uploads/thumbnails')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes); // changed from students to match requirements POST /api/student/register
app.use('/api/videos', videoRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stream', streamRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
