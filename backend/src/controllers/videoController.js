import mongoose from 'mongoose';
import { Video } from '../models/index.js';
import { processVideoToHLS } from '../workers/videoProcessor.js';
import { deleteFile, deleteFolder } from '../utils/minioClient.js';
import fs from 'fs';
import path from 'path';

export const uploadVideo = async (req, res, next) => {
  try {
    const { title, description, courseId } = req.body;

    const videoFile = req.files['video'] ? req.files['video'][0] : null;
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    if (!videoFile) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const rawVideoPath = videoFile.path;
    const thumbnailPath = thumbnailFile ? `/thumbnails/${thumbnailFile.filename}` : req.body.thumbnail;

    const courseObjectId = courseId && mongoose.Types.ObjectId.isValid(courseId) ? courseId : null;

    const video = await Video.create({
      title,
      description,
      videoPath: '', // Will be updated by the worker
      thumbnail: thumbnailPath,
      courseId: courseObjectId,
      instructorId: req.user.role === 'instructor' ? req.user.id : (req.body.instructorId || null),
      status: 'processing',
    });

    // Run HLS conversion worker in background
    processVideoToHLS(video.id, rawVideoPath).catch(console.error);

    res.status(201).json({ ...video, message: 'Video is uploading and processing.' });
  } catch (error) {
    next(error);
  }
};

export const createVideoFromS3 = async (req, res, next) => {
  try {
    const { title, description, courseId, s3Key, thumbnail } = req.body;

    if (!s3Key) {
      return res.status(400).json({ message: 's3Key is required for direct upload' });
    }

    const courseObjectId = courseId && mongoose.Types.ObjectId.isValid(courseId) ? courseId : null;

    const video = await Video.create({
      title,
      description,
      videoPath: '', // Will be updated by the worker
      thumbnail: thumbnail, // This might be an S3 key or URL too
      courseId: courseObjectId,
      instructorId: req.user.role === 'instructor' ? req.user.id : (req.body.instructorId || null),
      status: 'processing',
      s3Key: s3Key, // Store the raw video S3 key
    });

    // In a full implementation, the worker would download from S3, 
    // process, then upload HLS back to S3.
    // For now, we trigger the processor. We might need to handle the S3 source in the worker.
    processVideoToHLS(video.id, s3Key, true).catch(console.error);

    res.status(201).json({ ...video, message: 'Video record created. Processing initiated from S3 source.' });
  } catch (error) {
    next(error);
  }
};


export const getVideos = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'instructor') {
      query.instructorId = req.user.id;
    }

    const videos = await Video.find(query).populate('courseId', 'title').exec();

    const formatted = videos.map(v => ({
      ...v.toObject(),
      courseId: v.courseId ? (v.courseId.id || v.courseId._id?.toString?.()) : null,
      courseTitle: v.courseId ? v.courseId.title : 'No Course',
      uploadDate: v.createdAt,
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
    };

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const { title, description, courseId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const courseObjectId = courseId && mongoose.Types.ObjectId.isValid(courseId) ? courseId : null;

    const updateData = {
      title,
      description,
      courseId: courseObjectId,
    };

    const thumbnailFile = req.files?.['thumbnail']?.[0];
    if (thumbnailFile) {
      updateData.thumbnail = `/thumbnails/${thumbnailFile.filename}`;
    } else if (req.body.thumbnail !== undefined) {
      updateData.thumbnail = req.body.thumbnail;
    }

    const oldVideo = await Video.findById(req.params.id).exec();
    if (!oldVideo) return res.status(404).json({ message: 'Video not found' });

    if (req.user.role === 'instructor' && oldVideo.instructorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this video' });
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).exec();

    res.json(video);
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id).exec();
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (req.user.role === 'instructor' && video.instructorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this video' });
    }

    // 1. Delete HLS assets from S3
    if (video.videoPath && video.videoPath.startsWith('videos/hls/')) {
      const hlsPrefix = `videos/hls/${video._id}/`;
      await deleteFolder(hlsPrefix).catch(e => console.error('Failed to delete HLS folder:', e));
    }

    // 2. Delete raw video from S3 if it exists
    if (video.s3Key) {
      await deleteFile(video.s3Key).catch(e => console.error('Failed to delete raw S3 video:', e));
    }

    // 3. Delete thumbnail
    if (video.thumbnail) {
      if (video.thumbnail.startsWith('thumbnails/')) {
        // It's an S3 key
        await deleteFile(video.thumbnail).catch(e => console.error('Failed to delete S3 thumbnail:', e));
      } else if (video.thumbnail.startsWith('/thumbnails/')) {
        // It's a local path
        const localThumbPath = path.join('uploads', video.thumbnail);
        if (fs.existsSync(localThumbPath)) {
          fs.unlinkSync(localThumbPath);
        }
      }
    }

    await Video.findByIdAndDelete(req.params.id).exec();
    res.json({ message: 'Video and associated assets deleted successfully' });
  } catch (error) {
    next(error);
  }
};
