import mongoose from 'mongoose';
import { Video } from '../models/index.js';
import { processVideoToHLS } from '../workers/videoProcessor.js';

export const uploadVideo = async (req, res, next) => {
  try {
    const { title, description, duration, courseId } = req.body;

    const videoFile = req.files['video'] ? req.files['video'][0] : null;
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    if (!videoFile) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const rawVideoPath = videoFile.path;
    const thumbnailPath = thumbnailFile ? `/thumbnails/${thumbnailFile.filename}` : null;

    const courseObjectId = courseId && mongoose.Types.ObjectId.isValid(courseId) ? courseId : null;

    const video = await Video.create({
      title,
      description,
      videoPath: '', // Will be updated by the worker
      thumbnail: thumbnailPath,
      duration: duration ? parseInt(duration, 10) : null,
      courseId: courseObjectId,
      status: 'processing',
    });

    // Run HLS conversion worker in background
    processVideoToHLS(video.id, rawVideoPath).catch(console.error);

    res.status(201).json({ ...video, message: 'Video is uploading and processing.' });
  } catch (error) {
    next(error);
  }
};

export const getVideos = async (req, res, next) => {
  try {
    const videos = await Video.find().populate('courseId', 'title').exec();

    const formatted = videos.map(v => ({
      ...v.toObject(),
      courseId: v.courseId ? (v.courseId.id || v.courseId._id?.toString?.()) : null,
      courseTitle: v.courseId ? v.courseId.title : 'No Course',
      uploadDate: v.createdAt,
      duration: v.duration ? `${Math.floor(v.duration / 60)}:${(v.duration % 60).toString().padStart(2, '0')}` : '0:00',
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getVideoById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const v = await Video.findById(req.params.id).populate('courseId', 'title').exec();

    if (!v) return res.status(404).json({ message: 'Video not found' });

    const formatted = {
      ...v.toObject(),
      courseId: v.courseId ? (v.courseId.id || v.courseId._id?.toString?.()) : null,
      courseTitle: v.courseId ? v.courseId.title : 'No Course',
      uploadDate: v.createdAt,
      duration: v.duration ? `${Math.floor(v.duration / 60)}:${(v.duration % 60).toString().padStart(2, '0')}` : '0:00',
    };

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const { title, description, duration, courseId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const courseObjectId = courseId && mongoose.Types.ObjectId.isValid(courseId) ? courseId : null;

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        duration: duration ? parseInt(duration, 10) : undefined,
        courseId: courseObjectId,
      },
      { new: true }
    ).exec();

    res.json(video);
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Video not found' });
    }
    await Video.findByIdAndDelete(req.params.id).exec();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    next(error);
  }
};
