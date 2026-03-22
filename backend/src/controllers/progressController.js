import mongoose from 'mongoose';
import { WatchProgress } from '../models/index.js';

export const saveProgress = async (req, res, next) => {
  try {
    const { videoId, progressSeconds, completed } = req.body;
    const studentId = req.student.id;

    if (!videoId || progressSeconds === undefined) {
      return res.status(400).json({ message: 'videoId and progressSeconds are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: 'Invalid videoId' });
    }

    const existing = await WatchProgress.findOne({ studentId, videoId }).exec();

    if (existing) {
      existing.progress = progressSeconds;
      if (completed !== undefined) existing.completed = completed;
      existing.updatedAt = new Date();
      await existing.save();
      return res.json(existing);
    }

    const progress = await WatchProgress.create({
      studentId,
      videoId,
      progress: progressSeconds,
      completed: completed || false,
    });

    res.status(201).json(progress);
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const studentId = req.student.id;
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: 'Invalid videoId' });
    }

    const progress = await WatchProgress.findOne({ studentId, videoId }).exec();

    if (!progress) {
      return res.json({ progress: 0, completed: false });
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
};

export const getAllProgress = async (req, res, next) => {
  try {
    const studentId = req.student.id;
    const progressList = await WatchProgress.find({ studentId })
      .populate('videoId', 'title thumbnail courseId')
      .exec();

    res.json(progressList);
  } catch (error) {
    next(error);
  }
};
